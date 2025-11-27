import React from "react";
import "./ProfileCard.css";

export default function ProfileCard({ user, onLogout }) {
  const handleLogout = async () => {
    if (typeof onLogout === "function") {
      await onLogout();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="profile-user-card">
      <div className="profile-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} />
        ) : (
          <div className="avatar-placeholder">
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>
        )}
      </div>

      <h2 className="profile-name">{user.name}</h2>
      <p className="profile-email">{user.email || "email@example.com"}</p>
      <p className="profile-date">
        Дата регистрации: {user.createdAt || "01.01.2024"}
      </p>

      <div className="currency-box">
        <div className="currency-icon">💰</div>
        <span className="currency-value">1250</span>
        <div
          className="currency-help"
          title="Это внутриигровая валюта, которую можно использовать для разблокировки новых уроков и возможностей."
        >
          ?
        </div>
      </div>

      <button className="edit-btn">Редактировать профиль</button>
      <button className="logout-btn" onClick={handleLogout}>
        Выйти
      </button>
    </div>
  );
}
