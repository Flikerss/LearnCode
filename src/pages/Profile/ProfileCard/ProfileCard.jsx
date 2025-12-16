import React from "react";
import "./ProfileCard.css";

const DEFAULT_AVATAR_COLOR = "#ff8c00";

function resolveAvatar(user) {
  const raw = user?.avatar;
  if (typeof raw === "string" && raw.startsWith("color:")) {
    const [, colorValue] = raw.split("color:");
    return {
      type: "color",
      value: colorValue || DEFAULT_AVATAR_COLOR,
    };
  }

  if (raw) {
    return { type: "image", value: raw };
  }

  if (typeof user?.avatarColor === "string") {
    return { type: "color", value: user.avatarColor };
  }

  return { type: "color", value: DEFAULT_AVATAR_COLOR };
}

export default function ProfileCard({ user, onLogout, onEditProfile }) {
  const getFormattedDate = () => {
    if (!user?.createdAt) return "Дата регистрации: —";

    try {
      const localized = new Date(user.createdAt).toLocaleDateString("ru-RU");
      return `Дата регистрации: ${localized}`;
    } catch (error) {
      console.error("Не удалось преобразовать дату регистрации", error);
      return "Дата регистрации: —";
    }
  };

  const handleLogout = async () => {
    if (typeof onLogout === "function") {
      await onLogout();
    } else {
      window.location.href = "/";
    }
  };

  const handleEdit = () => {
    if (typeof onEditProfile === "function") {
      onEditProfile();
    }
  };

  const avatarMeta = resolveAvatar(user);
  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-user-card">
      <div className="profile-avatar">
        {avatarMeta.type === "image" ? (
          <img src={avatarMeta.value} alt={user.name} />
        ) : (
          <div
            className="avatar-placeholder"
            style={{ background: avatarMeta.value }}
          >
            {avatarLetter}
          </div>
        )}
      </div>

      <h2 className="profile-name">{user.name}</h2>
      <p className="profile-email">{user.email || "email@example.com"}</p>
      <p className="profile-date">{getFormattedDate()}</p>

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

      <div className="profile-actions">
        <button className="edit-btn" onClick={handleEdit}>
          Редактировать профиль
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>
      </div>
    </div>
  );
}
