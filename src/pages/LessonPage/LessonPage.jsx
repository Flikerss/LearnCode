import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Sidebar from "./Sidebar";
import LessonContent from "./LessonContent";
import { fetchLessons, fetchLessonById } from "../../api/lessons";
import LessonCompiler from "./LessonCompiler";
import { LessonPageSkeleton } from "../../components/Skeletons";
import "./LessonPage.css";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLessons();
        if (!active) return;
        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.lessons)
          ? data.lessons
          : [];

        if (raw.length) {
          const normalized = raw.map((l) => {
            const chapterTitle =
              l.chapterTitle ||
              (typeof l.chapter === "object" && l.chapter !== null ? l.chapter?.title : l.chapter) ||
              "";
            return {
              ...l,
              id: l._id?.toString?.() || l.id,
              title: l.title,
              chapter: chapterTitle || "Без главы",
              theory: l.theory?.[0]?.body || l.theory || "",
              practice: l.practiceTask?.description || l.practice || "",
              duration: l.duration ? `${l.duration} мин` : l.duration || "",
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

  useEffect(() => {
    localStorage.setItem("lastLessonId", lessonId);
  }, [lessonId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLessonLoading(true);
        const data = await fetchLessonById(lessonId);
        if (!active) return;
        const normalized = {
          id: data?._id?.toString?.() || lessonId,
          title: data?.title || "Урок",
          theory: Array.isArray(data?.theory)
            ? data.theory.map((block) =>
                typeof block === "string" ? block : block?.body || ""
              )
            : data?.theory
            ? [data.theory?.body || data.theory]
            : [],
          practice: data?.practiceTask?.description || data?.practice || "",
          practiceTask: {
            expectedOutput: data?.practiceTask?.expectedOutput || null,
            languageId: data?.practiceTask?.languageId || 63,
            testCases: data?.practiceTask?.testCases || [],
          },
          interactiveUrl: data?.interactiveUrl || null,
        };
        setLesson(normalized);
      } catch (err) {
        console.error("Не удалось загрузить урок", err);
        setLesson(null);
      } finally {
        if (active) setLessonLoading(false);
      }
    })();
    return () => {
      active = false;
    };
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

  const showSkeleton = loading || lessonLoading;

  return (
    <>
      <Navbar />
      {showSkeleton ? (
        <LessonPageSkeleton variant="inline" />
      ) : (
        <main className="lesson-page" aria-busy={showSkeleton || undefined}>
          <Sidebar currentLesson={lessonId} lessons={lessons} />
          <div className="lesson-content-wrapper">
            <LessonContent lesson={lesson} isLoading={lessonLoading} />
            <LessonCompiler lesson={lesson} lessonId={lessonId} />
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
