import React from "react";
import { useNavigate } from "react-router-dom";
import "./NextLessonHint.css";

export default function NextLessonHint({ lastLesson, nextLesson }) {
  const navigate = useNavigate();


  if (!lastLesson && !nextLesson) return null;

  return (
    <div className="next-lesson-hint">
      {lastLesson && (
        <div className="hint-block last">
          <p>📘 Вы остановились на уроке: <strong>{lastLesson.title}</strong></p>
          <button
            className="hint-btn"
            onClick={() => navigate(`/lessons/${lastLesson.id}`)}
          >
            Перейти к уроку
          </button>
        </div>
      )}

      {nextLesson && (
        <div className="hint-block next">
          <p>⏭ Следующий урок: <strong>{nextLesson.title}</strong></p>
          <button
            className="hint-btn"
            onClick={() => navigate(`/lessons/${nextLesson.id}`)}
          >
            Перейти к следующему уроку
          </button>
        </div>
      )}
    </div>
  );
}
