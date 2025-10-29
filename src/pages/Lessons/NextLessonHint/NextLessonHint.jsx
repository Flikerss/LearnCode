import React from "react";
import { useNavigate } from "react-router-dom";
import { lessonsData } from "../../../data/lessonsData";
import "./NextLessonHint.css";

export default function NextLessonHint({ lastLessonId }) {
  const navigate = useNavigate();

  const lastIndex = lessonsData.findIndex(l => l.id === lastLessonId);
  const last = lastIndex >= 0 ? lessonsData[lastIndex] : null;
  const next = lastIndex >= 0 && lastIndex < lessonsData.length - 1
    ? lessonsData[lastIndex + 1]
    : null;

  if (!last && !next) return null;

  return (
    <div className="next-lesson-hint">
      {last && (
        <div className="hint-block">
          <p>📘 Вы остановились на уроке: <strong>{last.title}</strong></p>
          <button className="hint-btn" onClick={() => navigate(`/lessons/${last.id}`)}>
            Перейти к уроку
          </button>
        </div>
      )}
      {next && (
        <div className="hint-block">
          <p>⏭ Следующий урок: <strong>{next.title}</strong></p>
          <button className="hint-btn" onClick={() => navigate(`/lessons/${next.id}`)}>
            Перейти к следующему уроку
          </button>
        </div>
      )}
    </div>
  );
}
