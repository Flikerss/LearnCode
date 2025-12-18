import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import ProgressBar from "./Progressbar/Progressbar";
import ProfileCard from "./ProfileCard/ProfileCard";
import Achievements from "./Achievements/Achievements";
import { AuthContext } from "../../context/AuthContext";
import { fetchLessons } from "../../api/lessons";
import ProfileEditModal from "./ProfileEditModal.jsx";

export default function Profile() {
  const [completedLessons, setCompletedLessons] = useState([]);
  const [lessonsData, setLessonsData] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const { user, isAuthLoading, logout, refreshUser } =
    useContext(AuthContext) || {};
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completedRaw = localStorage.getItem("completedLessons");
    if (completedRaw) setCompletedLessons(JSON.parse(completedRaw));
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLessonsLoading(true);
        const data = await fetchLessons();
        if (!active) return;
        
        const raw = Array.isArray(data)
          ? data
          : Array.isArray(data?.lessons)
          ? data.lessons
          : [];

        const normalized = raw.map((lesson) => {
          const chapterTitle =
            typeof lesson.chapter === "object" && lesson.chapter !== null
              ? lesson.chapter.title
              : lesson.chapter || lesson.chapterTitle || "";

          return {
            id: lesson._id?.toString?.() || lesson.id,
            chapter: chapterTitle || "Без главы",
          };
        });

        setLessonsData(normalized);
      } catch (error) {
        console.error("Не удалось загрузить уроки для профиля", error);
        if (active) setLessonsData([]);
      } finally {
        if (active) setLessonsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (isAuthLoading) {
    return (
      <div className="profile-wrapper" role="status">
        <p>Загружаем профиль…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-wrapper">
        <p>Пожалуйста, авторизуйтесь, чтобы увидеть профиль.</p>
      </div>
    );
  }

  const goToMain = () => {
    navigate("/");
  };

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <button className="back-btn" onClick={goToMain}>
          На главную
        </button>
      </div>
      <div className="profile-main">
        <ProfileCard
          user={user}
          onLogout={logout}
          onEditProfile={handleOpenEditModal}
        />
        <Achievements />
        <div className="profile-progress-area">
          <h3>Прогресс обучения</h3>
          {lessonsLoading ? (
            <p>Загружаем список уроков…</p>
          ) : lessonsData.length ? (
            <ProgressBar
              lessonsData={lessonsData}
              completedLessons={completedLessons}
            />
          ) : (
            <p>Не удалось получить список уроков.</p>
          )}
        </div>
      </div>
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={user}
        onProfileUpdated={refreshUser}
      />
    </div>
  );
}
