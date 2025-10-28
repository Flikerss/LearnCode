import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Tips from "../../components/Tips/Tips";
import Catalog from "../../components/Catalog/Catalog";
import "./Lessons.css";

export default function Lessons() {
  // пример структуры глав с уроками
  const chapters = [
    {
      id: 1,
      title: "Глава 1: Основы JS",
      lessons: [
        { id: 101, title: "Переменные", duration: "5 мин" },
        { id: 102, title: "Типы данных", duration: "7 мин" },
        { id: 103, title: "Функции", duration: "8 мин" },
      ],
    },
    {
      id: 2,
      title: "Глава 2: DOM и события",
      lessons: [
        { id: 201, title: "Выбор элементов", duration: "6 мин" },
        { id: 202, title: "События", duration: "9 мин" },
        { id: 203, title: "Манипуляции с DOM", duration: "10 мин" },
      ],
    },
  ];

  const [completedLessons, setCompletedLessons] = useState(
    JSON.parse(localStorage.getItem("completedLessons")) || []
  );

  const [lastLessonId, setLastLessonId] = useState(
    parseInt(localStorage.getItem("lastLessonId")) || null
  );

  const handleLessonClick = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId];
      setCompletedLessons(updated);
      localStorage.setItem("completedLessons", JSON.stringify(updated));
    }
    setLastLessonId(lessonId);
    localStorage.setItem("lastLessonId", lessonId);
  };

  return (
    <>
      <Navbar />
      <div className="lessons-page">
        <h1 className="page-title">Уроки</h1>
        <Tips chapters={chapters} lastLessonId={lastLessonId} />
        <Catalog
          chapters={chapters}
          completedLessons={completedLessons}
          handleLessonClick={handleLessonClick}
          lastLessonId={lastLessonId}
        />
      </div>
      <Footer />
    </>
  );
}
