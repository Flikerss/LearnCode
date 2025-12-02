import React from "react";
import "./LessonContent.css";

export default function LessonContent({ lesson, isLoading }) {
  if (isLoading) {
    return (
      <div className="lesson-content">
        <h2>Загрузка урока…</h2>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-content">
        <h2>Урок не найден</h2>
        <p>Попробуйте выбрать другой урок в списке слева.</p>
      </div>
    );
  }

  return (
    <div className="lesson-content">
      <h2>{lesson.title}</h2>
      <div className="lesson-block">
        <h3>📖 Теория</h3>
        {lesson.theory && lesson.theory.length ? (
          <div className="lesson-theory">
            {lesson.theory.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p>Материал скоро появится.</p>
        )}
      </div>
      <div className="lesson-block">
        <h3>💻 Практика</h3>
        {lesson.practice ? (
          <p>{lesson.practice}</p>
        ) : (
          <p>Задача находится в разработке.</p>
        )}
      </div>
    </div>
  );
}
