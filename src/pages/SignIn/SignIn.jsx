import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./SignIn.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // handle known backend error shapes
        const serverMessage = data?.error || data?.message || "Ошибка входа";
        // map specific status codes to clearer messages
        if (res.status === 400)
          setError(serverMessage || "Проверьте заполнение полей");
        else if (res.status === 401)
          setError(serverMessage || "Неверный email или пароль");
        else setError(serverMessage);
        return;
      }

      // success
      if (auth && typeof auth.login === "function") {
        auth.login({ user: data.user, token: data.token });
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      // redirect to home
      navigate("/");
    } catch (err) {
      // network or unexpected error
      setError(err.message || "Сетевая ошибка. Попробуйте позже");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <h2>Вход в аккаунт</h2>
        {error && <div className="form-error">{error}</div>}
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

          <button
            type="submit"
            className="btn-filled fullwidth"
            disabled={loading}
          >
            {loading ? "Вхожу..." : "Войти"}
          </button>
        </form>
      </div>
    </section>
  );
}
