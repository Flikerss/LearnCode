import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { lessonsData } from "../../data/lessonsData";
import "./Sidebar.css";

export default function Sidebar({ currentLesson, lessons }) {
  const source = lessons?.length ? lessons : lessonsData;

  const chapters = useMemo(() => {
    const grouped = source.reduce((acc, lesson) => {
      const chapterTitle = lesson.chapter || lesson.chapterTitle || "Уроки";
      if (!acc[chapterTitle]) {
        acc[chapterTitle] = [];
      }
      acc[chapterTitle].push(lesson);
      return acc;
    }, {});
    return Object.entries(grouped).map(([title, lessons]) => ({
      title,
      lessons,
    }));
  }, [source]);

  return (
    <aside className="lesson-sidebar">
      {chapters.map((ch) => (
        <div key={ch.title} className="chapter-block">
          <h4 className="chapter-title">{ch.title}</h4>
          <ul className="lesson-list">
            {ch.lessons.map((lesson) => (
              <li key={lesson.id}>
                <NavLink
                  to={`/lessons/${lesson.id}`}
                  className={({ isActive }) =>
                    isActive ? "active" : undefined
                  }
                >
                  {lesson.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
