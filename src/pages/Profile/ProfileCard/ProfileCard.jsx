import React from "react";
import "./ProfileCard.css";

const DEFAULT_AVATAR_COLOR = "#4b5563";

function parseAvatar(user) {
  const raw = user?.avatar;

  if (typeof raw === "string" && raw.startsWith("http")) {
    return { image: raw, color: null, emoji: null };
  }

  const meta = { color: DEFAULT_AVATAR_COLOR, emoji: null, image: null };

  if (typeof raw === "string") {
    raw.split(";").forEach((part) => {
      const token = part.trim();
      if (token.startsWith("color:")) {
        meta.color = token.split("color:")[1] || DEFAULT_AVATAR_COLOR;
      }
      if (token.startsWith("emoji:")) {
        meta.emoji = token.split("emoji:")[1] || null;
      }
    });

    if (!meta.color && raw.startsWith("color:")) {
      meta.color = raw.split("color:")[1] || DEFAULT_AVATAR_COLOR;
    }
  }

  if (!raw && typeof user?.avatarColor === "string") {
    meta.color = user.avatarColor;
  }

  return meta;
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

  const avatarMeta = parseAvatar(user);
  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="profile-user-card">
      <div className="profile-avatar">
        {avatarMeta.image ? (
          <img src={avatarMeta.image} alt={user.name} />
        ) : (
          <div
            className="avatar-placeholder"
            style={{ background: avatarMeta.color || DEFAULT_AVATAR_COLOR }}
          >
            {avatarMeta.emoji || avatarLetter}
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
