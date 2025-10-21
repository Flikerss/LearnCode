import React, { useState } from "react";
import "./SignIn.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Вход выполнен для: ${email}`);
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
