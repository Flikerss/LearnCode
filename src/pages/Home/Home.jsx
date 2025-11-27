import React from "react";
import "./Home.css";
import Advantages from "../../components/Advantages";
import Reviews from "../../components/Reviews";
import Courses from "../../components/Courses";
import Footer from "../../components/Footer";
import Codeblock from "./Codeblock/Codeblock";

export default function Home() {
  const scrollToCourses = () => {
    document.getElementById("courses").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="home">
        <div className="home-content">
          {/*<Codeblock />*/}
          <h1>Learncode</h1>
          <p>Изучай JavaScript и создавай реальные проекты вместе с нами!</p>
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
