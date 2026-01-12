import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Info, BookOpen, ShieldHalf, User, LogIn } from "lucide-react";
import "./Navbar.css";
import { AuthContext } from "../context/AuthContext";

const DEFAULT_AVATAR_COLOR = "#4b5563";

function parseAvatarString(raw) {
  if (typeof raw !== "string")
    return { color: DEFAULT_AVATAR_COLOR, emoji: null, image: null };

  // Image URL
  if (raw.startsWith("http")) {
    return { image: raw, color: null, emoji: null };
  }

  const parts = raw.split(";").map((p) => p.trim());
  const data = { color: DEFAULT_AVATAR_COLOR, emoji: null, image: null };

  parts.forEach((p) => {
    if (p.startsWith("color:")) {
      data.color = p.split("color:")[1] || DEFAULT_AVATAR_COLOR;
    }
    if (p.startsWith("emoji:")) {
      data.emoji = p.split("emoji:")[1] || null;
    }
  });

  if (!data.color && raw.startsWith("color:")) {
    data.color = raw.split("color:")[1] || DEFAULT_AVATAR_COLOR;
  }

  return data;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useContext(AuthContext);
  const user = auth ? auth.user : null;
  const navigate = useNavigate();

  const isGuest = !user;
  const userName = user ? user.name : "Гость";
  const userAvatar = user ? user.avatar : null;
  const avatarMeta = parseAvatarString(userAvatar);
  const avatarInitial = userName ? userName[0].toUpperCase() : "?";
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    if (auth && typeof auth.logout === "function") {
      await auth.logout();
    }
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"></div>
          <span className="logo-text">LearnCode</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/">
              <Home className="nav-icon" aria-hidden="true" />
              <span>Главная</span>
            </Link>
          </li>
          <li>
            <Link to="/about">
              <Info className="nav-icon" aria-hidden="true" />
              <span>О проекте</span>
            </Link>
          </li>
          <li>
            <Link to="/lessons">
              <BookOpen className="nav-icon" aria-hidden="true" />
              <span>Уроки</span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin">
                <ShieldHalf className="nav-icon" aria-hidden="true" />
                <span>Админ панель</span>
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-right">
          {isGuest ? (
            <div className="navbar-actions">
              <Link to="/login" className="btn-outline">
                <LogIn className="nav-icon" aria-hidden="true" />
                <span>Войти</span>
              </Link>
              <Link to="/register" className="btn-filled">
                <User className="nav-icon" aria-hidden="true" />
                <span>Регистрация</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/profile"
              className="navbar-user"
              onClick={() => setIsOpen(false)}
            >
              <div className="avatar-wrapper">
                {avatarMeta.image ? (
                  <img
                    src={avatarMeta.image}
                    alt={userName}
                    className="avatar"
                  />
                ) : (
                  <div
                    className="avatar-placeholder"
                    style={{
                      backgroundColor: avatarMeta.color || DEFAULT_AVATAR_COLOR,
                    }}
                  >
                    {avatarMeta.emoji || avatarInitial}
                  </div>
                )}
              </div>
              <span className="username">{userName}</span>
            </Link>
          )}

          <div
            className={`hamburger ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <ul className="mobile-links">
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>
              <Home className="nav-icon" aria-hidden="true" />
              <span>Главная</span>
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setIsOpen(false)}>
              <Info className="nav-icon" aria-hidden="true" />
              <span>О проекте</span>
            </Link>
          </li>
          <li>
            <Link to="/lessons" onClick={() => setIsOpen(false)}>
              <BookOpen className="nav-icon" aria-hidden="true" />
              <span>Уроки</span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <ShieldHalf className="nav-icon" aria-hidden="true" />
                <span>Админ панель</span>
              </Link>
            </li>
          )}

          {!isGuest && (
            <li>
              <button className="mobile-link-btn" onClick={handleProfileClick}>
                Профиль
              </button>
            </li>
          )}
        </ul>

        {isGuest ? (
          <div className="mobile-actions">
            <Link
              to="/login"
              className="btn-outline fullwidth"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="nav-icon" aria-hidden="true" />
              <span>Войти</span>
            </Link>
            <Link
              to="/register"
              className="btn-filled fullwidth"
              onClick={() => setIsOpen(false)}
            >
              <User className="nav-icon" aria-hidden="true" />
              <span>Регистрация</span>
            </Link>
          </div>
        ) : (
          <div className="mobile-user">
            <button className="btn-logout fullwidth" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
