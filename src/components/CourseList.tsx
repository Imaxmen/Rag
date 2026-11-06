"use client";

import { useState } from "react";
import type { Course } from "@/lib/catalog";

const rubles = new Intl.NumberFormat("ru-RU");

export default function CourseList({ courses }: { courses: Course[] }) {
  const directions = [...new Set(courses.map((c) => c.direction).filter(Boolean))];
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? courses.filter((c) => c.direction === active) : courses;

  return (
    <>
      <div className="filters" role="group" aria-label="Направление">
        <button type="button" aria-pressed={active === null} onClick={() => setActive(null)}>
          Все
        </button>
        {directions.map((d) => (
          <button key={d} type="button" aria-pressed={active === d} onClick={() => setActive(d)}>
            {d}
          </button>
        ))}
      </div>

      <ul className="courses">
        {visible.map((c) => (
          <li key={c.title}>
            <div className="course-main">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <p className="meta">
                {[c.direction, c.age, c.duration, c.format, c.teacher].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="course-price">
              <span className="price">{rubles.format(c.price)} сум</span>
              <span className="meta">за месяц</span>
              {c.oldPrice !== null && (
                <s className="meta">
                  <span className="visually-hidden">Старая цена </span>
                  {rubles.format(c.oldPrice)} сум
                </s>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
