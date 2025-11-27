import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Catalog from "../../components/Catalog/Catalog";
import NextLessonHint from "./NextLessonHint/NextLessonHint";
import { lessonsData as staticLessons } from "../../data/lessonsData";
import CatalogSkeleton from "../../components/Catalog/CatalogSkeleton";
import { useLoadingDelay } from "../../components/Skeleton/useLoadingDelay";
import { fetchLessons } from "../../api/lessons";
import "./Lessons.css";

export default function Lessons() {
  const [lessons, setLessons] = useState(staticLessons);
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
        // Expecting an array; fallback to static if not
        if (Array.isArray(data) && data.length) {
          // Normalize to the fields used by UI if necessary
          const normalized = data.map((l) => ({
            id: l._id?.toString?.() || l.id,
            title: l.title,
            chapter: l.chapterTitle || l.chapter || "",
            theory: l.theory?.[0]?.body || l.theory || "",
            practice: l.practiceTask?.description || l.practice || "",
            duration: l.duration ? `${l.duration} мин` : l.duration || "",
          }));
          setLessons(normalized);
        } else {
          setLessons(staticLessons);
        }
      } catch (e) {
        setError(e);
        setLessons(staticLessons);
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

  const showSkeleton = useLoadingDelay(loading, 200, 350, true);

  return (
    <>
      <Navbar />
      <main className="lessons-page" aria-busy={showSkeleton || undefined}>
        <h1 className="page-title">Каталог уроков</h1>
        {showSkeleton ? (
          <CatalogSkeleton />
        ) : (
          <>
            <NextLessonHint lastLesson={lastLesson} nextLesson={nextLesson} />
            <Catalog
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
