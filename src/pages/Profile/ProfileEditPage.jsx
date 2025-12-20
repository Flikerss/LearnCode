import React, { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileEditPage.css";
import {
  updateUserAvatar,
  updateUserName,
  updateUserPassword,
} from "../../api/user";
import { AuthContext } from "../../context/AuthContext";
import {
  validateDisplayName,
  validatePassword,
  validatePasswordWithConfirm,
} from "../../utils/validation";

const DEFAULT_AVATAR_COLOR = "#4b5563";
const AVATAR_COLORS = [
  "#4b5563",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#111827",
  "#0ea5e9",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
];

const AVATAR_EMOJIS = [
  "🐱",
  "🦊",
  "🐼",
  "🐧",
  "🐸",
  "🦁",
  "🦉",
  "🐙",
  "🐨",
  "🐰",
];

function extractAvatarColor(user) {
  const raw = user?.avatar;
  if (typeof raw === "string" && raw.startsWith("color:")) {
    const [, color] = raw.split("color:");
    return color || DEFAULT_AVATAR_COLOR;
  }
  return DEFAULT_AVATAR_COLOR;
}

function extractAvatarEmoji(user) {
  const raw = user?.avatar;
  if (typeof raw === "string" && raw.includes("emoji:")) {
    const match = raw
      .split(";")
      .find((part) => part.trim().startsWith("emoji:"));
    if (match) {
      const [, emoji] = match.split("emoji:");
      return emoji || null;
    }
  }
  return null;
}

function getErrorMessage(error, fallback) {
  return (
    error?.body?.error || error?.body?.message || error?.message || fallback
  );
}

function resolveUserId(user) {
  if (!user) return undefined;
  const rawId = user.id || user._id;
  if (!rawId) return undefined;
  if (typeof rawId === "string") return rawId.trim() || undefined;
  if (typeof rawId === "object" && rawId.$oid) return rawId.$oid;
  if (typeof rawId === "object" && typeof rawId.toString === "function") {
    return rawId.toString();
  }
  return undefined;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isAuthLoading = auth?.isAuthLoading;
  const refreshUser = auth?.refreshUser;

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarColor, setAvatarColor] = useState(DEFAULT_AVATAR_COLOR);
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_EMOJIS[0]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const avatarPreviewInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "?";
  const displayNamePreview = (name && name.trim()) || user?.name || "Ваше имя";

  const userId = useMemo(() => resolveUserId(user), [user]);

  useEffect(() => {
    setName(user?.name || "");
    setAvatarColor(extractAvatarColor(user));
    setAvatarEmoji(extractAvatarEmoji(user) || AVATAR_EMOJIS[0]);
    setStatusMessage(null);
    setErrorMessage(null);
  }, [user]);

  const handleBack = () => navigate("/profile");

  const refreshProfile = async () => {
    if (typeof refreshUser === "function") {
      await refreshUser();
    }
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const nameError = validateDisplayName(trimmedName);
    if (nameError) {
      setErrorMessage(nameError);
      return;
    }
    if (trimmedName === user?.name) {
      setStatusMessage("Имя уже актуально");
      return;
    }
    if (!userId) {
      setErrorMessage("Не удалось определить пользователя. Войдите снова.");
      return;
    }

    setIsSavingName(true);
    setErrorMessage(null);
    try {
      await updateUserName({ userId, name: trimmedName });
      await refreshProfile();
      setStatusMessage("Имя обновлено");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Не удалось обновить имя"));
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (!currentPassword) {
      setErrorMessage("Введите текущий пароль");
      return;
    }

    const newPasswordError = validatePasswordWithConfirm(
      newPassword,
      confirmPassword
    );
    if (newPasswordError) {
      setErrorMessage(newPasswordError);
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage("Новый пароль должен отличаться от текущего");
      return;
    }

    setIsSavingPassword(true);
    setErrorMessage(null);
    try {
      await updateUserPassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatusMessage("Пароль обновлен");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Не удалось обновить пароль"));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleAvatarSubmit = async (event) => {
    event.preventDefault();
    if (!avatarColor) {
      setErrorMessage("Выберите цвет аватара");
      return;
    }

    setIsSavingAvatar(true);
    setErrorMessage(null);
    try {
      const avatarPayload = `color:${avatarColor};emoji:${avatarEmoji || ""}`;
      await updateUserAvatar({ avatar: avatarPayload });
      await refreshProfile();
      setStatusMessage("Аватар обновлен");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Не удалось обновить аватар"));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="profile-edit-page__shell" role="status">
        <p>Загружаем профиль…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-edit-page__shell">
        <p>Пожалуйста, авторизуйтесь, чтобы редактировать профиль.</p>
      </div>
    );
  }

  return (
    <div className="profile-edit-page">
      <div className="profile-edit-container">
        <div className="profile-edit-page__header">
          <div className="header-text">
            <p className="eyebrow">Профиль</p>
            <h1>Редактирование</h1>
            <p className="muted">Имя, пароль и ваш аватар.</p>
          </div>
          <div className="header-actions">
            <p className="muted">Вы вошли как</p>
            <p className="header-user">{user?.email || user?.name}</p>
            <button className="ghost-btn" onClick={handleBack}>
              ← Назад к профилю
            </button>
          </div>
        </div>

        {(errorMessage || statusMessage) && (
          <div
            className={`banner ${
              errorMessage ? "banner--error" : "banner--ok"
            }`}
          >
            {errorMessage || statusMessage}
          </div>
        )}

        <div className="profile-edit-grid">
          <section className="card card--stretch">
            <div className="card-head">
              <div>
                <p className="eyebrow">Основное</p>
                <h2>Имя</h2>
                <p className="muted">Отобразится в профиле и отзывах.</p>
              </div>
            </div>
            <form className="form" onSubmit={handleNameSubmit}>
              <label className="field">
                <span>Отображаемое имя</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Например, Ирина Петрова"
                />
              </label>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSavingName}
                >
                  {isSavingName ? "Сохраняем..." : "Сохранить имя"}
                </button>
              </div>
            </form>
          </section>

          <section className="card card--stretch">
            <div className="card-head">
              <div>
                <p className="eyebrow">Безопасность</p>
                <h2>Смена пароля</h2>
                <p className="muted">Задайте новый пароль для входа.</p>
              </div>
            </div>
            <form className="form" onSubmit={handlePasswordSubmit}>
              <label className="field">
                <span>Текущий пароль</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </label>
              <label className="field">
                <span>Новый пароль</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Минимум 6 символов"
                  autoComplete="new-password"
                />
              </label>
              <label className="field">
                <span>Подтвердите новый пароль</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                />
              </label>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-secondary"
                  disabled={isSavingPassword}
                >
                  {isSavingPassword ? "Обновляем..." : "Обновить пароль"}
                </button>
              </div>
            </form>
          </section>

          <section className="card card--accent card--stretch">
            <div className="card-head">
              <div>
                <p className="eyebrow">Визуал</p>
                <h2>Аватар</h2>
                <p className="muted">Цвет фона и эмодзи.</p>
              </div>
            </div>

            <div className="avatar-preview">
              <div
                className="avatar-preview__circle"
                style={{ backgroundColor: avatarColor || DEFAULT_AVATAR_COLOR }}
              >
                {avatarEmoji || avatarPreviewInitial}
              </div>
              <div className="avatar-preview__meta">
                <p className="eyebrow">Превью</p>
                <p className="avatar-preview__label">{displayNamePreview}</p>
              </div>
            </div>

            <form className="form" onSubmit={handleAvatarSubmit}>
              <div className="avatar-grid">
                {AVATAR_COLORS.map((color) => (
                  <label key={color} className="avatar-swatch">
                    <input
                      type="radio"
                      name="avatarColor"
                      value={color}
                      checked={avatarColor === color}
                      onChange={() => setAvatarColor(color)}
                    />
                    <span style={{ backgroundColor: color }} />
                  </label>
                ))}
              </div>
              <div className="emoji-grid">
                {AVATAR_EMOJIS.map((emoji) => (
                  <label key={emoji} className="emoji-swatch">
                    <input
                      type="radio"
                      name="avatarEmoji"
                      value={emoji}
                      checked={avatarEmoji === emoji}
                      onChange={() => setAvatarEmoji(emoji)}
                    />
                    <span>{emoji}</span>
                  </label>
                ))}
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-ghost"
                  disabled={isSavingAvatar}
                >
                  {isSavingAvatar ? "Сохраняем..." : "Сохранить аватар"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
