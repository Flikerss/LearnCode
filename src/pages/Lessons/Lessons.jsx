import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Catalog from "../../components/Catalog/Catalog";
import NextLessonHint from "./NextLessonHint/NextLessonHint";
import { LessonsSkeleton } from "../../components/Skeletons";
import { fetchLessons } from "../../api/lessons";
import "./Lessons.css";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(() => {
    return JSON.parse(localStorage.getItem("completedLessons")) || [];
  });

  const [lastLessonId, setLastLessonId] = useState(() => {
    return localStorage.getItem("lastLessonId") || null;
  });

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLessons();
        if (!active) return;

        const raw = Array.isArray(data?.lessons)
          ? data.lessons
          : Array.isArray(data)
          ? data
          : [];

        if (raw.length) {
          const normalized = raw.map((l) => {
            const chapterTitle =
              typeof l.chapter === "object" && l.chapter !== null
                ? l.chapter.title
                : l.chapter || l.chapterTitle || "";

            return {
              ...l,
              id: l._id?.toString?.() || l.id,
              chapter: chapterTitle || "Без главы",
            };
          });
          setLessons(normalized);
        } else {
          setLessons([]);
        }
      } catch (e) {
        setError(e);
        setLessons([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const getNextLesson = useCallback(() => {
    return lessons.find((lesson) => !completed.includes(lesson.id)) || null;
  }, [completed, lessons]);

  const [nextLesson, setNextLesson] = useState(getNextLesson());

  useEffect(() => {
    setNextLesson(getNextLesson());
  }, [completed, getNextLesson]);

  const handleLessonClick = (id) => {
    let addedNew = false;

    if (!completed.includes(id)) {
      const updated = [...completed, id];
      setCompleted(updated);
      localStorage.setItem("completedLessons", JSON.stringify(updated));
      addedNew = true;
    }

    if (addedNew) {
      sessionStorage.setItem("lessonJustCompleted", "true");
    }

    setLastLessonId(id);
    localStorage.setItem("lastLessonId", id);
  };

  const lastLesson = lastLessonId
    ? lessons.find((l) => l.id === lastLessonId)
    : null;

  const showSkeleton = loading;

  return (
    <>
      <Navbar />
      <main className="lessons-page" aria-busy={showSkeleton || undefined}>
        <h1 className="page-title">Каталог уроков</h1>
        {showSkeleton ? (
          <LessonsSkeleton variant="inline" />
        ) : (
          <>
            <NextLessonHint lastLesson={lastLesson} nextLesson={nextLesson} />
            <Catalog
              lessons={lessons}
              completedLessons={completed}
              nextLesson={nextLesson}
              handleLessonClick={handleLessonClick}
            />
          </>
        )}
        {error && (
          <p className="error" role="alert">
            Не удалось загрузить уроки. Показаны локальные данные.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
