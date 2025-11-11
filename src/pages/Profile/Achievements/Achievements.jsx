import React from "react";
import "./Achievements.css";

export default function Achievements() {
  return (
    <div className="profile-achievements">
      <h3>Мои достижения</h3>
      <div className="achievements-grid">
        <div className="achievement-card received">
          <div className="achievement-image">
            <div className="ach-icon">🎓</div>
          </div>
          <div className="achievement-text">
            <p>Начни обучение</p>
          </div>
        </div>
        <div className="achievement-card received">
          <div className="achievement-image">
            <div className="ach-icon">📘</div>
          </div>
          <div className="achievement-text">
            <p>Пройди первый урок</p>
          </div>
        </div>
        <div className="achievement-card locked">
          <div className="achievement-image">
            <div className="ach-icon">🔥</div>
          </div>
          <div className="achievement-text">
            <p>Достигни 50% курса</p>
          </div>
        </div>
        <div className="achievement-card locked">
          <div className="achievement-image">
            <div className="ach-icon">🏆</div>
          </div>
          <div className="achievement-text">
            <p>Учись 3 дня подряд</p>
          </div>
        </div>
      </div>
      <button className="more-ach-btn">Посмотреть все достижения</button>
    </div>
  );
}