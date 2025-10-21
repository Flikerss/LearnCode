import React from "react";
import "./Courses.css";

const lessons = [
  { id: 1, title: "Введение" },
  { id: 2, title: "Первый урок" },
  { id: 3, title: "Второй урок" },
  { id: 4, title: "и тд" },
  { id: 5, title: "и тп" },
];

export default function Courses() {
  return (
    <section id="courses" className="courses">
      <h2>уроки по JavaScript</h2>
      <div className="lessons-list">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="lesson-card">
            <div className="lesson-info">
              <span className="lesson-number">{lesson.id}.</span>
              <span className="lesson-title">{lesson.title}</span>
            </div>
            <button className="lesson-btn">нна урок</button>
          </div>
        ))}
      </div>
    </section>
  );
}
