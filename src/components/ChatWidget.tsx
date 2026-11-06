"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const HINTS = ["Какие курсы у вас есть?", "Какая есть рассрочка?", "С какого возраста можно учиться?"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const log = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const history: Message[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const update = (patch: Partial<Message>) =>
      setMessages((all) => [...all.slice(0, -1), { ...all[all.length - 1], ...patch }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        update({ content: data?.error ?? "Не удалось получить ответ. Попробуйте ещё раз." });
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        update({ content: answer });
      }
      update({ content: answer.trim() || "Ответ пустой. Попробуйте переформулировать вопрос." });
    } catch {
      update({ content: "Нет связи с сервером. Проверьте интернет и попробуйте ещё раз." });
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="chat">
      {open && (
        <section className="chat-panel" role="dialog" aria-label="Ассистент школы">
          <header className="chat-head">
            <div>
              <strong>Ассистент</strong>
              <p className="meta">Отвечает по материалам школы</p>
            </div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Закрыть чат">
              ×
            </button>
          </header>

          <div className="chat-log" ref={log} aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p className="soft">Спросите про курсы, цены, преподавателей, возраст или оплату.</p>
                <div className="chat-hints">
                  {HINTS.map((hint) => (
                    <button key={hint} type="button" onClick={() => void send(hint)}>
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-${m.role}`}>
                <p>{m.content.replaceAll("**", "") || (busy && i === messages.length - 1 ? "Думаю…" : "")}</p>
              </div>
            ))}
          </div>

          <form className="chat-form" onSubmit={onSubmit}>
            <input
              ref={field}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ваш вопрос"
              aria-label="Ваш вопрос"
              maxLength={2000}
            />
            <button type="submit" className="button button-small" disabled={busy || !input.trim()}>
              Отправить
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="button chat-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Свернуть" : "Задать вопрос"}
      </button>
    </div>
  );
}
