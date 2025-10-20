import React, { useEffect, useState } from "react";
import "./Home.css";
import Advantages from "../../components/Advantages";
import Reviews from "../../components/Reviews";
import Courses from "../../components/Courses";
import Footer from "../../components/Footer";

export default function Home() {
  const [serverData, setServerData] = useState(null);

  useEffect(() => {
    fetch("/api/date")
      .then((res) => res.json())
      .then((data) => setServerData(data))
      .catch(() =>
        setServerData({ message: "Ошибка соединения с сервером" })
      );
  }, []);

  const scrollToCourses = () => {
    document.getElementById("courses").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="home">
        <div className="home-content">
          <h1>LearnCode на связи 🤙🤙</h1>
          <p>Изучай JavaScript и создавай реальные проекты вместе с нами!</p>

          {serverData ? (
            <div className="server-info">
              <p>{serverData.message}</p>
              {serverData.date && <p>{serverData.date}</p>}
            </div>
          ) : (
            <p className="server-info">Загрузка данных с сервера...</p>
          )}

          <button className="start-btn" onClick={scrollToCourses}>
            Начать обучение
          </button>
        </div>
      </section>

      <Courses />
      <Advantages />
      <Reviews />
      <Footer />
    </>
  );
}
