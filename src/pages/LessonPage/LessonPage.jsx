import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Sidebar from "./Sidebar";
import LessonContent from "./LessonContent";
import { lessonsData } from "../../data/lessonsData";
import "./LessonPage.css";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(
    JSON.parse(localStorage.getItem("completedLessons")) || []
  );

  useEffect(() => {
    if (!completed.includes(lessonId)) {
      const updated = [...completed, lessonId];
      setCompleted(updated);
      localStorage.setItem("completedLessons", JSON.stringify(updated));
    }
    localStorage.setItem("lastLessonId", lessonId);
  }, [lessonId]);

  const currentIndex = lessonsData.findIndex(l => l.id === lessonId);
  const prevLesson = lessonsData[currentIndex - 1] || null;
  const nextLesson = lessonsData[currentIndex + 1] || null;

  return (
    <>
      <Navbar />
      <main className="lesson-page">
        <Sidebar currentLesson={lessonId} />
        <div className="lesson-content-wrapper">
          <LessonContent lessonId={lessonId} />
          <div className="lesson-navigation">
            {prevLesson ? (
              <button onClick={() => navigate(`/lessons/${prevLesson.id}`)}>◀ Предыдущий урок</button>
            ) : <div />}
            {nextLesson && (
              <button onClick={() => navigate(`/lessons/${nextLesson.id}`)}>Следующий урок ▶</button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
