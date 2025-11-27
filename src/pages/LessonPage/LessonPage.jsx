import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Sidebar from "./Sidebar";
import LessonContent from "./LessonContent";
import { lessonsData as staticLessons } from "../../data/lessonsData";
import LessonPageSkeleton from "./LessonPageSkeleton";
import { useLoadingDelay } from "../../components/Skeleton/useLoadingDelay";
import { fetchLessons } from "../../api/lessons";
import "./LessonPage.css";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(
    JSON.parse(localStorage.getItem("completedLessons")) || []
  );
  const [lessons, setLessons] = useState(staticLessons);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLessons();
        if (!active) return;
        if (Array.isArray(data) && data.length) {
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

  useEffect(() => {
    if (!completed.includes(lessonId)) {
      const updated = [...completed, lessonId];
      setCompleted(updated);
      localStorage.setItem("completedLessons", JSON.stringify(updated));
    }
    localStorage.setItem("lastLessonId", lessonId);
  }, [lessonId]);

  const currentIndex = useMemo(
    () => lessons.findIndex((l) => l.id === lessonId),
    [lessons, lessonId]
  );
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  const showSkeleton = useLoadingDelay(loading, 200);

  return (
    <>
      <Navbar />
      {showSkeleton ? (
        <LessonPageSkeleton />
      ) : (
        <main className="lesson-page" aria-busy={showSkeleton || undefined}>
          <Sidebar currentLesson={lessonId} />
          <div className="lesson-content-wrapper">
            <LessonContent lessonId={lessonId} />
            <div className="lesson-navigation">
              {prevLesson ? (
                <button onClick={() => navigate(`/lessons/${prevLesson.id}`)}>
                  ◀ Предыдущий урок
                </button>
              ) : (
                <div />
              )}
              {nextLesson && (
                <button onClick={() => navigate(`/lessons/${nextLesson.id}`)}>
                  Следующий урок ▶
                </button>
              )}
            </div>
          </div>
        </main>
      )}
      <Footer />
    </>
  );
}
