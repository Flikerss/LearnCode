import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Advantages from "../../components/Advantages";
import Reviews from "../../components/Reviews";
import Courses from "../../components/Courses";
import Footer from "../../components/Footer";
import { Rocket, Compass, Briefcase } from "lucide-react";
// import Codeblock from "./Codeblock/Codeblock"; // keeping for later use

export default function Home() {
  const navigate = useNavigate();
  const scrollToCourses = () => {
    document.getElementById("courses").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="home">
        <div className="home-container">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="pill">Онлайн-трек по JavaScript</div>
              <h1>
                Учись писать продакшн-код
                <span className="accent"> быстрее</span>
              </h1>
              <p className="lead">
                Пошаговые уроки, интерактивные задания и практика на реальных
                примерах. Доведи свой стек до уровня, которого ждут на собесах.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/register")}
                >
                  Начать бесплатно
                </button>
                <button className="btn btn-ghost" onClick={scrollToCourses}>
                  Смотреть программу
                </button>
              </div>
              <ul className="hero-points">
                <li>Задачи с автопроверкой</li>
                <li>Код-ревью и подсказки</li>
                <li>Подборка лучших практик</li>
              </ul>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-value">12k+</span>
                  <span className="stat-label">решённых задач</span>
                </div>
                <div className="stat">
                  <span className="stat-value">4.8/5</span>
                  <span className="stat-label">средняя оценка</span>
                </div>
                <div className="stat">
                  <span className="stat-value">7 недель</span>
                  <span className="stat-label">до уверенного JS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="steps-card" aria-label="Как это работает">
            <div className="steps-title">
              <p className="pill pill-muted">Как это устроено</p>
              <h2>Три шага до результата</h2>
            </div>
            <div className="steps-grid">
              <div className="step">
                <div className="step-icon" aria-hidden="true">
                  <Rocket />
                </div>
                <h3>Старт</h3>
                <p>Выбираешь трек и проходишь быстрый онбординг под свой уровень.</p>
              </div>
              <div className="step">
                <div className="step-icon" aria-hidden="true">
                  <Compass />
                </div>
                <h3>Практика</h3>
                <p>Уроки с заданиями, автопроверкой и код-ревью. Подсказки — рядом.</p>
              </div>
              <div className="step">
                <div className="step-icon" aria-hidden="true">
                  <Briefcase />
                </div>
                <h3>Портфолио</h3>
                <p>Собираешь проекты и готовишься к собеседованиям по чеклисту.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Courses />
      <Advantages />
      <Reviews />
      <Footer />
    </>
  );
}
