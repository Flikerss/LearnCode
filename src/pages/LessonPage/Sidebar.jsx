import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ currentLesson, lessons }) {
  const source = lessons && lessons.length ? lessons : [];

  const chapters = useMemo(() => {
    if (!Array.isArray(source) || source.length === 0) return [];

    const grouped = source.reduce((acc, lesson) => {
      const chapterTitle =
        typeof lesson.chapter === "object" && lesson.chapter !== null
          ? lesson.chapter.title
          : lesson.chapter || lesson.chapterTitle || "Уроки";

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
