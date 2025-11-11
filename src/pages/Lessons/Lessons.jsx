import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Catalog from "../../components/Catalog/Catalog";
import NextLessonHint from "./NextLessonHint/NextLessonHint";
import { lessonsData } from "../../data/lessonsData";
import "./Lessons.css";

export default function Lessons() {
  const [completed, setCompleted] = useState(() => {
    return JSON.parse(localStorage.getItem("completedLessons")) || [];
  });

  // lastLessonId — id урока, на котором пользователь остановился (последний открытый)
  const [lastLessonId, setLastLessonId] = useState(() => {
    return localStorage.getItem("lastLessonId") || null;
  });

  // вычисляем следующий урок — первый, который не в completed
  const getNextLesson = useCallback(() => {
    return lessonsData.find((lesson) => !completed.includes(lesson.id)) || null;
  }, [completed]);

  const [nextLesson, setNextLesson] = useState(getNextLesson());

  useEffect(() => {
    setNextLesson(getNextLesson());
  }, [completed, getNextLesson]);

  // Обработчик клика/перехода к уроку
  // всегда обновляем lastLessonId (пользователь открыл этот урок)
  // и помечаем урок как пройденный, если ещё не пройден
const handleLessonClick = (id) => {
  let addedNew = false;

  if (!completed.includes(id)) {
    const updated = [...completed, id];
    setCompleted(updated);
    localStorage.setItem("completedLessons", JSON.stringify(updated));
    addedNew = true;
  }

  // Запоминаем, что был добавлен новый урок — для анимации прогресса
  if (addedNew) {
    sessionStorage.setItem("lessonJustCompleted", "true");
  }

  // Сохраняем последний урок
  setLastLessonId(id);
  localStorage.setItem("lastLessonId", id);
};


  // Получаем объекты уроков (или null)
  const lastLesson = lastLessonId ? lessonsData.find(l => l.id === lastLessonId) : null;

  return (
    <>
      <Navbar />
      <main className="lessons-page">
        <h1 className="page-title">Каталог уроков</h1>

        {/* Передаём оба: lastLesson и nextLesson */}
        <NextLessonHint lastLesson={lastLesson} nextLesson={nextLesson} />

        <Catalog
          completedLessons={completed}
          nextLesson={nextLesson}
          handleLessonClick={handleLessonClick}
        />
      </main>
      <Footer />
    </>
  );
}
