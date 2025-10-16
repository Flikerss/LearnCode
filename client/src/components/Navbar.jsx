import React from "react";
import "./Navbar.css";

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <div className="logo-icon"></div>
                    <span className="logo-text">LearnCode</span>
                </div>

                <ul className="navbar-links">
                    <li>Уроки</li>
                    <li>О нас</li>
                    <li>Контакты</li>
                </ul>

                <div className="navbar-buttons">
                    <button className="btn-outline">Войти</button>
                    <button className="btn-filled">Регистрация</button>
                </div>
            </div>
        </nav>
    )
}