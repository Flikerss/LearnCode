import React, { useState, useEffect } from "react";
import "./Profile.css";
import { lessonsData as staticLessons } from "../../data/lessonsData";
import ProgressBar from "./progressbar/ProgressBar";
import ProfileCard from "./ProfileCard/ProfileCard";
import Achievements from "./Achievements/Achievements";

export default function Profile() {
  const [lessonsData] = useState(staticLessons);
  const [user, setUser] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const completedRaw = localStorage.getItem("completedLessons");
    if (completedRaw) setCompletedLessons(JSON.parse(completedRaw));
  }, []);

  if (!user) {
    return (
      <div className="profile-wrapper">
        <p>Пожалуйста, авторизуйтесь, чтобы увидеть профиль.</p>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      {/* Шапка */}
      <div className="profile-header"></div>

      {/* Основной блок */}
      <div className="profile-main">
        <ProfileCard user={user} />
        <Achievements />
        
        {/* Прогресс обучения */}
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