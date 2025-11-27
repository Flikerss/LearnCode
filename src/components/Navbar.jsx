import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const auth = useContext(AuthContext);
  const user = auth ? auth.user : null;
  const navigate = useNavigate();

  const isGuest = !user;
  const userName = user ? user.name : "Гость";
  const userAvatar = user ? user.avatar : null;

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
            <Link to="/">Главная</Link>
          </li>
          <li>
            <Link to="/about">О проекте</Link>
          </li>
          <li>
            <Link to="/lessons">Уроки</Link>
          </li>
        </ul>

        <div className="navbar-right">
          {isGuest ? (
            <div className="navbar-actions">
              <Link to="/login" className="btn-outline">
                Войти
              </Link>
              <Link to="/register" className="btn-filled">
                Регистрация
              </Link>
            </div>
          ) : (
            <Link
              to="/profile"
              className="navbar-user"
              onClick={() => setIsOpen(false)}
            >
              <div className="avatar-wrapper">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {userName ? userName[0].toUpperCase() : "?"}
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
              Главная
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setIsOpen(false)}>
              О проекте
            </Link>
          </li>
          <li>
            <Link to="/lessons" onClick={() => setIsOpen(false)}>
              Уроки
            </Link>
          </li>

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
              Войти
            </Link>
            <Link
              to="/register"
              className="btn-filled fullwidth"
              onClick={() => setIsOpen(false)}
            >
              Регистрация
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
