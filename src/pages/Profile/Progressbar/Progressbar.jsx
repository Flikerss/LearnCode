import React, { useState, useRef, useEffect, useMemo } from "react";

import "./ProgressBar.css";

export default function ProgressBar({ completedLessons, lessonsData }) {
  const [open, setOpen] = useState(false);

  const chapters = useMemo(() => {
    if (!Array.isArray(lessonsData) || lessonsData.length === 0) {
      return [];
    }
    const map = {};
    lessonsData.forEach((l) => {
      if (!map[l.chapter]) map[l.chapter] = [];
      map[l.chapter].push(l);
    });
    return Object.entries(map).map(([chapter, lessons]) => ({
      chapter,
      lessons,
    }));
  }, [lessonsData]);

  const initialProgress = (() => {
    try {
      const saved = sessionStorage.getItem("profileChapterProgress");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })();

  const [progress, setProgress] = useState(initialProgress);
  const previous = useRef(initialProgress);
  const anim = useRef({});

  const animate = (chapter, start, target) => {
    if (anim.current[chapter]) cancelAnimationFrame(anim.current[chapter]);

    const duration = 600;
    const startTime = performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = t * (2 - t);
      const current = start + (target - start) * eased;

      setProgress((p) => ({ ...p, [chapter]: current }));

      if (t < 1) {
        anim.current[chapter] = requestAnimationFrame(step);
      } else {
        previous.current[chapter] = target;
        sessionStorage.setItem(
          "profileChapterProgress",
          JSON.stringify(previous.current)
        );
      }
    };

    anim.current[chapter] = requestAnimationFrame(step);
  };

  useEffect(() => {
    chapters.forEach((ch) => {
      const count = ch.lessons.filter((l) =>
        completedLessons.includes(l.id)
      ).length;
      const target = Math.round((count / ch.lessons.length) * 100);

      const last = previous.current[ch.chapter];

      if (last === undefined) {
        previous.current[ch.chapter] = target;
        setProgress((p) => ({ ...p, [ch.chapter]: target }));
      } else if (last !== target) {
        animate(ch.chapter, last, target);
      }
    });

    sessionStorage.setItem(
      "profileChapterProgress",
      JSON.stringify(previous.current)
    );
  }, [completedLessons, chapters]);

  const overallPercent = useMemo(() => {
    if (!Array.isArray(lessonsData) || lessonsData.length === 0) {
      return 0;
    }

    const lessonIds = new Set(lessonsData.map((lesson) => lesson.id));
    let completedCount = 0;

    completedLessons.forEach((id) => {
      if (lessonIds.has(id)) {
        completedCount += 1;
      }
    });

    const percent = Math.round((completedCount / lessonsData.length) * 100);
    return Math.min(100, Math.max(0, percent));
  }, [lessonsData, completedLessons]);

  return (
    <>
      <div className="profile-progress-main">
        <div className="progress-left">
          <div className="bar">
            <div className="fill" style={{ width: `${overallPercent}%` }} />
          </div>
          <span className="lessons-count">
            {Math.min(completedLessons.length, lessonsData.length)} из{" "}
            {lessonsData.length} уроков
          </span>
        </div>

        <span className="num">{overallPercent}%</span>

        <button className="more-btn" onClick={() => setOpen(true)}>
          Подробнее
        </button>
      </div>

      {open && (
        <div className="progress-modal">
          <div className="progress-modal-box">
            <h2>Прогресс по главам</h2>

            {chapters.map((ch) => (
              <div className="chapter-line" key={ch.chapter}>
                <span>{ch.chapter}</span>
                <div className="bar small">
                  <div
                    className="fill"
                    style={{ width: `${progress[ch.chapter] ?? 0}%` }}
                  />
                </div>
                <span className="num small">
                  {Math.round(progress[ch.chapter] ?? 0)}%
                </span>
              </div>
            ))}

            <button className="close-btn" onClick={() => setOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
}
