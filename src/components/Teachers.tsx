import type { Teacher } from "@/lib/catalog";

export default function Teachers({ teachers }: { teachers: Teacher[] }) {
  return (
    <section className="section teachers" id="teachers" aria-labelledby="teachers-title">
      <h2 id="teachers-title">Преподаватели</h2>
      <ul>
        {teachers.map((t) => (
          <li key={t.name}>
            <div>
              <h3>{t.name}</h3>
              <p className="teacher-role">{t.role}</p>
              {t.experience && <p className="meta">{t.experience}</p>}
            </div>
            <p>{t.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
