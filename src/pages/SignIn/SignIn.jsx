import React, { useState } from "react";
import "./SignIn.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка входа");

      localStorage.setItem("token", data.token);
      alert(`Добро пожаловать, ${data.user.name}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <h2>Вход в аккаунт</h2>
        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn-filled fullwidth">
            Войти
          </button>
        </form>
      </div>
    </section>
  );
}
