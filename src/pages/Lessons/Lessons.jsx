import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Catalog from "../../components/Catalog/Catalog";
import NextLessonHint from "./NextLessonHint/NextLessonHint";
import "./Lessons.css";

export default function Lessons() {
  const [completed, setCompleted] = useState(
    JSON.parse(localStorage.getItem("completedLessons")) || []
  );

  const lastLesson = localStorage.getItem("lastLessonId") || null;

  const handleLessonClick = (id) => {
    if (!completed.includes(id)) {
      const updated = [...completed, id];
      setCompleted(updated);
      localStorage.setItem("completedLessons", JSON.stringify(updated));
    }
    localStorage.setItem("lastLessonId", id);
  };

  return (
    <>
      <Navbar />
      <main className="lessons-page">
        <h1 className="page-title">Каталог уроков</h1>
        <NextLessonHint lastLessonId={lastLesson} />
        <Catalog
          completedLessons={completed}
          lastLessonId={lastLesson}
          handleLessonClick={handleLessonClick}
        />
      </main>
      <Footer />
    </>
  );
}
