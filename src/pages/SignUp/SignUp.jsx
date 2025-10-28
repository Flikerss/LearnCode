import React, { useState } from "react";
import "./SignUp.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка регистрации");

    alert("Регистрация успешна! Теперь войдите в аккаунт.");
  } catch (err) {
    alert(err.message);
  }
};


  return (
    <section className="auth-page">
      <div className="auth-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Имя:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Пароль:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn-filled fullwidth">Зарегистрироваться</button>
        </form>
      </div>
    </section>
  );
}
