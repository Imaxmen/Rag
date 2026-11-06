import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import { extractText } from "unpdf";
import * as XLSX from "xlsx";

export const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge");
export const SUPPORTED = [".md", ".txt", ".pdf", ".docx", ".xlsx", ".xls", ".csv"];

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const DIMENSIONS = 768;
const CHUNK_SIZE = 900;
const BATCH = 32;

type Chunk = { source: string; text: string; vector: number[] };
type Index = { signature: string; chunks: Chunk[] };

export type Hit = { source: string; text: string; score: number };

export class MissingKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY не задан");
  }
}

export function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new MissingKeyError();
  return new GoogleGenAI({ apiKey });
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(full);
      return SUPPORTED.includes(path.extname(entry.name).toLowerCase()) ? [full] : [];
    }),
  );
  return nested.flat().sort();
}

function sheetsToText(buffer: Buffer): string {
  const workbook = XLSX.read(buffer);
  return workbook.SheetNames.flatMap((name) =>
    XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[name]).map((row) => {
      const cells = Object.entries(row)
        .filter(([, value]) => String(value ?? "").trim() !== "")
        .map(([key, value]) => `${key}: ${String(value).trim()}`);
      return `[${name}] ${cells.join("; ")}`;
    }),
  ).join("\n");
}

async function readText(file: string): Promise<string> {
  const ext = path.extname(file).toLowerCase();
  const buffer = await readFile(file);
  if (ext === ".pdf") {
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    return text;
  }
  if (ext === ".docx") return (await mammoth.extractRawText({ buffer })).value;
  if (ext === ".xlsx" || ext === ".xls" || ext === ".csv") return sheetsToText(buffer);
  return buffer.toString("utf8");
}

// Режет текст по строкам примерно на CHUNK_SIZE символов; последняя строка повторяется в следующем фрагменте.
export function chunkText(text: string): string[] {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => (line.length > CHUNK_SIZE * 1.5 ? line.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) ?? [] : [line]));

  const chunks: string[] = [];
  let current: string[] = [];
  let size = 0;
  for (const line of lines) {
    if (size + line.length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current.join("\n"));
      current = [current[current.length - 1]];
      size = current[0].length;
    }
    current.push(line);
    size += line.length + 1;
  }
  if (current.length > 0) chunks.push(current.join("\n"));
  return chunks;
}

async function embed(texts: string[], taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"): Promise<number[][]> {
  const ai = getClient();
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: texts.slice(i, i + BATCH),
      config: { taskType, outputDimensionality: DIMENSIONS },
    });
    for (const item of response.embeddings ?? []) vectors.push(item.values ?? []);
  }
  if (vectors.length !== texts.length) throw new Error("Gemini вернул неполный набор эмбеддингов");
  return vectors;
}

async function build(signature: string, files: string[]): Promise<Index> {
  const pieces: { source: string; text: string }[] = [];
  for (const file of files) {
    const source = path.relative(KNOWLEDGE_DIR, file).split(path.sep).join("/");
    const text = await readText(file);
    for (const piece of chunkText(text)) pieces.push({ source, text: piece });
  }
  const vectors = await embed(
    pieces.map((p) => `Файл: ${p.source}\n\n${p.text}`),
    "RETRIEVAL_DOCUMENT",
  );
  return { signature, chunks: pieces.map((p, i) => ({ ...p, vector: vectors[i] })) };
}

// Индекс живёт в памяти процесса и пересобирается, когда меняется состав, размер или дата файлов.
const store = globalThis as unknown as { __ragIndex?: Promise<Index> };

async function getIndex(): Promise<Index> {
  const files = await listFiles(KNOWLEDGE_DIR);
  const stats = await Promise.all(files.map((file) => stat(file)));
  const signature = files.map((file, i) => `${file}:${stats[i].size}:${stats[i].mtimeMs}`).join("|");

  const current = store.__ragIndex;
  if (current) {
    const index = await current.catch(() => null);
    if (index?.signature === signature) return index;
  }
  const next = build(signature, files);
  store.__ragIndex = next;
  try {
    return await next;
  } catch (error) {
    store.__ragIndex = undefined;
    throw error;
  }
}

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export async function search(query: string, limit = 6): Promise<Hit[]> {
  const index = await getIndex();
  const [vector] = await embed([query], "RETRIEVAL_QUERY");
  return index.chunks
    .map((chunk) => ({ source: chunk.source, text: chunk.text, score: cosine(vector, chunk.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
