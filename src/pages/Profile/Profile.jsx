import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import { lessonsData as staticLessons } from "../../data/lessonsData";
import ProgressBar from "./Progressbar/Progressbar";
import ProfileCard from "./ProfileCard/ProfileCard";
import Achievements from "./Achievements/Achievements";
import { AuthContext } from "../../context/AuthContext";
import ProfileSkeleton from "./ProfileSkeleton";

export default function Profile() {
  const [lessonsData] = useState(staticLessons);
  const [completedLessons, setCompletedLessons] = useState([]);
  const { user, isAuthLoading, logout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const completedRaw = localStorage.getItem("completedLessons");
    if (completedRaw) setCompletedLessons(JSON.parse(completedRaw));
  }, []);

  if (isAuthLoading) {
    return <ProfileSkeleton />;
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

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <button className="back-btn" onClick={goToMain}>
          На главную
        </button>
      </div>
      <div className="profile-main">
        <ProfileCard user={user} onLogout={logout} />
        <Achievements />
        <div className="profile-progress-area">
          <h3>Прогресс обучения</h3>
          <ProgressBar
            lessonsData={lessonsData}
            completedLessons={completedLessons}
          />
        </div>
      </div>
    </div>
  );
}
