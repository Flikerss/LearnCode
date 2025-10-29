import React from "react";
import { useNavigate } from "react-router-dom";
import { lessonsData } from "../../data/lessonsData";
import "./Catalog.css";

export default function Catalog({ completedLessons, lastLessonId, handleLessonClick }) {
  const navigate = useNavigate();

  const chapters = Array.from(
    new Set(lessonsData.map((l) => l.chapter))
  ).map((chapter) => ({
    title: chapter,
    lessons: lessonsData.filter((l) => l.chapter === chapter),
  }));


  const nextLessonIndex = lastLessonId
    ? lessonsData.findIndex(l => l.id === lastLessonId) + 1
    : 0;
  const nextLesson = lessonsData[nextLessonIndex] || null;

  const handleClick = (lesson) => {
    handleLessonClick(lesson.id);
    navigate(`/lessons/${lesson.id}`);
  };

  return (
    <div className="catalog">
      {chapters.map((ch) => {
        const progress = Math.round(
          (ch.lessons.filter((l) => completedLessons.includes(l.id)).length / ch.lessons.length) * 100
        );

        return (
          <div key={ch.title} className="chapter">
            <div className="chapter-header">
              <h3>{ch.title}</h3>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="lessons-list">
              {ch.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`lesson-card 
                    ${completedLessons.includes(lesson.id) ? "completed" : ""} 
                    ${nextLesson && lesson.id === nextLesson.id ? "next" : ""}`}
                  onClick={() => handleClick(lesson)}
                >
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="lesson-duration">{lesson.duration}</span>
                  {nextLesson && lesson.id === nextLesson.id && (
                    <span className="hint">Следующий урок</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
