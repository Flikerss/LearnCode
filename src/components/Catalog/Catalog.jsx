import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsData } from "../../data/lessonsData";
import "./Catalog.css";

export default function Catalog({ completedLessons, nextLesson, handleLessonClick }) {
  const navigate = useNavigate();

  const chapters = Array.from(new Set(lessonsData.map(l => l.chapter))).map(chapter => ({
    title: chapter,
    lessons: lessonsData.filter(l => l.chapter === chapter),
  }));

  // --- восстанавливаем прогресс сразу при инициализации ---
  const initialProgress = (() => {
    try {
      const saved = sessionStorage.getItem("chapterProgress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();

  const [progress, setProgress] = useState(initialProgress);
  const previousProgress = useRef(initialProgress);
  const animationRefs = useRef({});

  // === Функция анимации ===
  const animateProgress = (chapterTitle, start, target) => {
    if (animationRefs.current[chapterTitle]) {
      cancelAnimationFrame(animationRefs.current[chapterTitle]);
    }

    const duration = 600;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t * (2 - t);
      const current = start + (target - start) * eased;

      setProgress(prev => ({ ...prev, [chapterTitle]: current }));

      if (t < 1) {
        animationRefs.current[chapterTitle] = requestAnimationFrame(step);
      } else {
        previousProgress.current[chapterTitle] = target;
        animationRefs.current[chapterTitle] = null;
        sessionStorage.setItem("chapterProgress", JSON.stringify(previousProgress.current));
      }
    };

    animationRefs.current[chapterTitle] = requestAnimationFrame(step);
  };

  // === Реакция на изменения completedLessons ===
  useEffect(() => {
    chapters.forEach(ch => {
      const completedCount = ch.lessons.filter(l => completedLessons.includes(l.id)).length;
      const targetPercent = Math.round((completedCount / ch.lessons.length) * 100);
      const lastValue = previousProgress.current[ch.title];

      // первый рендер: просто выставляем без анимации
      if (lastValue === undefined) {
        previousProgress.current[ch.title] = targetPercent;
        setProgress(prev => ({ ...prev, [ch.title]: targetPercent }));
      } else if (lastValue !== targetPercent) {
        animateProgress(ch.title, lastValue, targetPercent);
      }
    });

    sessionStorage.setItem("chapterProgress", JSON.stringify(previousProgress.current));
  }, [completedLessons]);

  const handleClick = (lesson) => {
    handleLessonClick(lesson.id);
    navigate(`/lessons/${lesson.id}`);
  };

  return (
    <div className="catalog">
      {chapters.map(ch => (
        <div key={ch.title} className="chapter">
          <div className="chapter-header">
            <h3>{ch.title}</h3>
            <div className="progress-bar">
              <div
                className="progress"
                style={{
                  width: `${progress[ch.title] ?? previousProgress.current[ch.title] ?? 0}%`
                }}
              />
            </div>
          </div>

          <div className="lessons-list">
            {ch.lessons.map(lesson => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isNext = nextLesson && nextLesson.id === lesson.id;

              return (
                <div
                  key={lesson.id}
                  className={`lesson-card ${isCompleted ? "completed" : ""} ${isNext ? "next" : ""}`}
                  onClick={() => handleClick(lesson)}
                >
                  <span className="lesson-title">{lesson.title}</span>
                  <span className="lesson-duration">{lesson.duration}</span>
                  {isNext && <span className="hint">Следующий урок</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
