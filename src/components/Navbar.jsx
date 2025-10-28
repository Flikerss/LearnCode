import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user] = useState(null);

  const isGuest = !user;
  const userName = user ? user.name : "Гость";
  const userAvatar = user ? user.avatar : null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* ЛОГО */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"></div>
          <span className="logo-text">LearnCode</span>
        </Link>

        {/* ССЫЛКИ */}
        <ul className="navbar-links">
          <li><Link to="/">Главная</Link></li>
          <li><Link to="/about">О проекте</Link></li>
          <li><Link to="/lessons">Уроки</Link></li>
        </ul>

        {/* ПРАВАЯ ЧАСТЬ */}
        <div className="navbar-right">
          {isGuest && (
            <div className="navbar-actions">
              <Link to="/login" className="btn-outline">Войти</Link>
              <Link to="/register" className="btn-filled">Регистрация</Link>
            </div>
          )}

          <div className="navbar-user">
            <div className="avatar-wrapper">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="avatar" />
              ) : (
                <div className="avatar-placeholder"></div>
              )}
            </div>
            <span className="username">{userName}</span>
          </div>

          {/* БУРГЕР */}
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

      {/* МОБИЛЬНОЕ МЕНЮ */}
      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        <ul className="mobile-links">
          <li><Link to="/" onClick={() => setIsOpen(false)}>Главная</Link></li>
          <li><Link to="/about" onClick={() => setIsOpen(false)}>О проекте</Link></li>
          <li><Link to="/lessons" onClick={() => setIsOpen(false)}>Уроки</Link></li>
        </ul>

        {isGuest && (
          <div className="mobile-actions">
            <Link to="/login" className="btn-outline fullwidth" onClick={() => setIsOpen(false)}>Войти</Link>
            <Link to="/register" className="btn-filled fullwidth" onClick={() => setIsOpen(false)}>Регистрация</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
