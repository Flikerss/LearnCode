import React, { useEffect, useMemo, useState } from "react";
import "./ProfileEditModal.css";
import {
  updateUserAvatar,
  updateUserName,
  updateUserPassword,
} from "../../api/user";

const DEFAULT_AVATAR_COLOR = "#ff8c00";
const AVATAR_COLORS = [
  "#ff8c00",
  "#f3722c",
  "#f9844a",
  "#f9c74f",
  "#90be6d",
  "#43aa8b",
  "#577590",
  "#6a4c93",
  "#c77dff",
  "#2ab3c6",
];

function extractAvatarColor(user) {
  const raw = user?.avatar;
  if (typeof raw === "string" && raw.startsWith("color:")) {
    const [, color] = raw.split("color:");
    return color || DEFAULT_AVATAR_COLOR;
  }
  return DEFAULT_AVATAR_COLOR;
}

function getErrorMessage(error, fallback) {
  return (
    error?.body?.error || error?.body?.message || error?.message || fallback
  );
}

function resolveUserId(user) {
  if (!user) {
    return undefined;
  }

  if (typeof user.id === "string" && user.id.length > 0) {
    return user.id;
  }

  const rawId = user._id;
  if (!rawId) {
    return undefined;
  }

  if (typeof rawId === "string" && rawId.length > 0) {
    return rawId;
  }

  if (typeof rawId === "object") {
    if (typeof rawId.$oid === "string") {
      return rawId.$oid;
    }
    if (typeof rawId.toString === "function") {
      const stringified = rawId.toString();
      return stringified.startsWith("ObjectId(")
        ? stringified.replace(/ObjectId\("(.*)"\)/, "$1")
        : stringified;
    }
  }

  return undefined;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarColor, setAvatarColor] = useState(DEFAULT_AVATAR_COLOR);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAvatarColor(extractAvatarColor(user));
      setStatusMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, user]);

  const userId = useMemo(() => resolveUserId(user), [user]);

  if (!isOpen) {
    return null;
  }

  const closeModal = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const refreshProfile = async () => {
    if (typeof onProfileUpdated === "function") {
      await onProfileUpdated();
    }
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage("Имя не может быть пустым");
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
    if (!currentPassword || !newPassword) {
      setErrorMessage("Заполните текущий и новый пароль");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Новый пароль должен быть длиннее 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Пароли не совпадают");
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage("Новый пароль должен отличаться от текущего");
      return;
    }
    if (!userId) {
      setErrorMessage("Не удалось определить пользователя. Войдите снова.");
      return;
    }

    setIsSavingPassword(true);
    setErrorMessage(null);
    try {
      await updateUserPassword({
        userId,
        currentPassword,
        newPassword,
      });
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
    if (!userId) {
      setErrorMessage("Не удалось определить пользователя. Войдите снова.");
      return;
    }

    setIsSavingAvatar(true);
    setErrorMessage(null);
    try {
      await updateUserAvatar({ userId, avatar: `color:${avatarColor}` });
      await refreshProfile();
      setStatusMessage("Цвет аватара обновлен");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Не удалось обновить аватар"));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <div className="profile-edit-modal" role="dialog" aria-modal="true">
      <div className="profile-edit-modal__backdrop" onClick={closeModal} />
      <div className="profile-edit-modal__content" role="document">
        <header className="profile-edit-modal__header">
          <div>
            <p className="modal-kicker">Настройки профиля</p>
            <h2>Редактирование профиля</h2>
          </div>
          <button className="modal-close-btn" onClick={closeModal}>
            ×
          </button>
        </header>

        {(errorMessage || statusMessage) && (
          <div className={`modal-alert ${errorMessage ? "error" : "success"}`}>
            {errorMessage || statusMessage}
          </div>
        )}

        <section>
          <form className="modal-form" onSubmit={handleNameSubmit}>
            <h3>Имя</h3>
            <label className="modal-field">
              <span>Отображаемое имя</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Например, Ирина Петрова"
              />
            </label>
            <div className="modal-actions">
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

        <section>
          <form className="modal-form" onSubmit={handlePasswordSubmit}>
            <h3>Смена пароля</h3>
            <label className="modal-field">
              <span>Текущий пароль</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="••••••••"
              />
            </label>
            <label className="modal-field">
              <span>Новый пароль</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Минимум 6 символов"
              />
            </label>
            <label className="modal-field">
              <span>Подтвердите новый пароль</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Повторите пароль"
              />
            </label>
            <div className="modal-actions">
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

        <section>
          <form className="modal-form" onSubmit={handleAvatarSubmit}>
            <h3>Цвет аватара</h3>
            <div className="avatar-color-grid">
              {AVATAR_COLORS.map((color) => (
                <label key={color} className="avatar-color-option">
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
            <div className="modal-actions">
              <button
                type="submit"
                className="btn-ghost"
                disabled={isSavingAvatar}
              >
                {isSavingAvatar ? "Сохраняем..." : "Сохранить цвет"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
