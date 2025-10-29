import React from "react";
import { lessonsData } from "../../data/lessonsData";
import "./LessonContent.css";

export default function LessonContent({ lessonId }) {
  const lesson = lessonsData.find(l => l.id === lessonId) || { title: "Урок не найден", theory: "-", practice: "-" };

  return (
    <div className="lesson-content">
      <h2>{lesson.title}</h2>
      <div className="lesson-block">
        <h3>📖 Теория</h3>
        <p>{lesson.theory}</p>
      </div>
      <div className="lesson-block">
        <h3>💻 Практика</h3>
        <p>{lesson.practice}</p>
      </div>
    </div>
  );
}
