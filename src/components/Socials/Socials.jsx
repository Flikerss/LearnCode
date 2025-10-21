import React, { useState } from "react";
import "./Socials.css";

export default function Socials({ data }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [status, setStatus] = useState(""); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Отправка...");

    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus("Сообщение успешно отправлено!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("Ошибка отправки. Попробуйте позже.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Ошибка отправки. Попробуйте позже.");
    }
    setTimeout(() => setStatus(""), 3000);
  };

  return (
    <section className="socials-section">
      <div className="socials-container">
        <div className="socials-left">
          <h2>Мы в сети</h2>
          <div className="socials-list vertical">
            {data.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-card"
              >
                <div className="social-icon">
                  <img src={item.img} alt={item.name} />
                </div>
                <p>{item.name}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="socials-right">
          <h2>Обратная связь</h2>
          <form className="feedback-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Ваше имя"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Сообщение"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Отправить</button>

            {status && (
              <p
                className={`form-status ${
                  status.includes("Ошибка") ? "error visible" : "success visible"
                }`}
              >
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
