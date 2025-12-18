import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLessons } from "../api/lessons";
import "./Courses.css";

export default function Courses() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchLessons();
        if (!active) return;

        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.lessons)
          ? data.lessons
          : [];

        if (raw.length) {
          const normalized = raw.slice(0, 5).map((l, index) => ({
            id: l._id?.toString() || l.id,
            title: l.title || `Урок ${index + 1}`,
            order: l.order || index + 1,
          }));
          setLessons(normalized);
        } else {
          setLessons([]);
        }
      } catch (error) {
        console.error("Ошибка загрузки уроков:", error);
        setLessons([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLessonClick = (lessonId) => {
    navigate(`/lessons/${lessonId}`);
  };

  return (
    <section id="courses" className="courses">
      <h2>уроки по JavaScript</h2>
      {loading ? (
        <div className="lessons-list">
          <p>Загрузка уроков...</p>
        </div>
      ) : lessons.length > 0 ? (
        <div className="lessons-list">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-info">
                <span className="lesson-number">{lesson.order || lesson.id}.</span>
                <span className="lesson-title">{lesson.title}</span>
              </div>
              <button
                className="lesson-btn"
                onClick={() => handleLessonClick(lesson.id)}
              >
                На урок
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="lessons-list">
          <p>Уроки пока не добавлены</p>
        </div>
      )}
    </section>
  );
}
