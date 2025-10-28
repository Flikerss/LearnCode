import React from "react";
import "./Tips.css";

export default function Tips({ chapters, lastLessonId }) {
  if (!lastLessonId) return null;

  const allLessons = chapters.flatMap((c) => c.lessons);
  const lastLesson = allLessons.find((l) => l.id === lastLessonId);
  const lastIndex = allLessons.findIndex((l) => l.id === lastLessonId);
  const nextLesson = allLessons[lastIndex + 1] || null;

  return (
    <div className="tips">
      <p>
        Вы остановились на уроке: <strong>{lastLesson.title}</strong>
      </p>
      {nextLesson && (
        <p className="next-lesson">
          Следующий урок: <strong>{nextLesson.title}</strong>
        </p>
      )}
    </div>
  );
}
