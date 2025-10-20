import React from "react";
import { Link } from "react-router-dom";
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
                    <li><Link to="/">Главная</Link></li>
                    <li><Link to="/about">О проекте</Link></li>
                    <li><Link to="/courses">Уроки</Link></li>
                </ul>

                <div className="navbar-buttons">
                    <button className="btn-outline">Войти</button>
                    <button className="btn-filled">Регистрация</button>
                </div>
            </div>
        </nav>
    )
}