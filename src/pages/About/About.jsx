import React from "react";
import Team from "../../components/Team/Team";
import Stats from "../../components/Stats/Stats";
import FAQ from "../../components/FAQ/FAQ";
import Socials from "../../components/Socials/Socials";
import Footer from "../../components/Footer";
import { aboutData } from "../../data/aboutData";
import "./About.css";

export default function About() {
  return (
    <>
      <section className="about">
        <div className="container">
          <h1>О проекте</h1>
          <p>
            LearnCode — это образовательная платформа, созданная для тех, кто
            хочет изучать JavaScript и веб-разработку на практике. Мы делаем
            обучение понятным, современным и интересным.
          </p>
          <p>
            На сайте ты найдёшь пошаговые уроки, практические задания и реальные
            проекты, чтобы прокачивать навыки каждый день.
          </p>
        </div>

        <Team data={aboutData.team} />
        <Stats data={aboutData.stats} />
        <FAQ data={aboutData.faq} />
        <Socials data={aboutData.socials} />
      </section>

      <Footer />
    </>
  );
}
