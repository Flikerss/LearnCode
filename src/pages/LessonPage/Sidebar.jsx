import React from "react";
import { NavLink } from "react-router-dom";
import { lessonsData } from "../../data/lessonsData";
import "./Sidebar.css";

export default function Sidebar({ currentLesson }) {
  const chapters = [...new Set(lessonsData.map(l => l.chapter))].map(ch => ({
    title: ch,
    lessons: lessonsData.filter(l => l.chapter === ch),
  }));

  return (
    <aside className="lesson-sidebar">
      {chapters.map(ch => (
        <div key={ch.title} className="chapter-block">
          <h4 className="chapter-title">{ch.title}</h4>
          <ul className="lesson-list">
            {ch.lessons.map(lesson => (
              <li key={lesson.id}>
                <NavLink
                  to={`/lessons/${lesson.id}`}
                  className={({ isActive }) => isActive ? "active" : undefined}
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
