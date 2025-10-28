import React from "react";
import "./Catalog.css";

export default function Catalog({ chapters, completedLessons, handleLessonClick, lastLessonId }) {
  const allLessons = chapters.flatMap(c => c.lessons);
  const nextLessonIndex = lastLessonId ? allLessons.findIndex(l => l.id === lastLessonId) + 1 : 0;

  return (
    <div className="catalog">
      {chapters.map(ch => {
        const progress = Math.round(
          (ch.lessons.filter(l => completedLessons.includes(l.id)).length /
            ch.lessons.length) * 100
        );

        return (
          <div key={ch.id} className="chapter">
            <div className="chapter-header">
              <h3>{ch.title}</h3>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="lessons-list">
              {ch.lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className={`lesson-card ${
                    completedLessons.includes(lesson.id) ? "completed" : ""
                  } ${idx === nextLessonIndex ? "next" : ""}`}
                  onClick={() => handleLessonClick(lesson.id)}
                >
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="lesson-duration">{lesson.duration}</span>
                  {idx === nextLessonIndex && <span className="hint">Следующий урок</span>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
