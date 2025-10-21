import vinnie from "../assets/winnie.jpeg";
import github from "../assets/github.png";
import telegram from "../assets/telegram.png";
import mail from "../assets/mail.png";

export const aboutData = {
  team: [
    { name: "Манычкин Артём", role: "Frontend Developer", photo: vinnie },
    { name: "Абакаров Рашидхан", role: "Backend Developer", photo: vinnie },
    { name: "Горбунов Вячеслав", role: "UI/UX Designer", photo: vinnie },
  ],

  stats: [
    { label: "Ученики", value: "1200" },
    { label: "Проектов", value: "35" },
    { label: "Уроков", value: "80" },
    { label: "Отзывов", value: "250" },
  ],

  faq: [
    {
      question: "Можно ли проходить курс без опыта?",
      answer:
        "Да, курс рассчитан на новичков. Всё начинается с базового синтаксиса JavaScript и постепенно переходит к реальным проектам.",
    },
    {
      question: "Есть ли поддержка преподавателя?",
      answer:
        "Да, ты можешь задать вопросы в Telegram-чате, и преподаватель ответит лично.",
    },
    {
      question: "Будут ли практические задания?",
      answer:
        "Конечно! После каждого блока — мини-проект, где ты применяешь полученные знания.",
    },
    {
      question: "Можно ли проходить курс в своём темпе?",
      answer:
        "Да, ты можешь учиться в удобное время — доступ к материалам не ограничен.",
    },
  ],

  socials: [
    {
      name: "GitHub",
      href: "https://github.com/Flikerss/LearnCode",
      img: github,
    },
    {
      name: "Telegram",
      href: "https://t.me/learncode_ru",
      img: telegram,
    },
    {
      name: "Email",
      href: "mailto:learncode.support@gmail.com",
      img: mail,
    },
  ],
};
