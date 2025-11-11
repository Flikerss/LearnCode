import React, { createContext, useEffect, useState } from "react";
import Toast from "../components/Toast/Toast";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to read user from localStorage", e);
    }
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const login = ({ user: userObj, token }) => {
    try {
      if (token) localStorage.setItem("token", token);
      if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj || null);
      showToast(`Добро пожаловать, ${userObj.name}!`, "success");
    } catch (e) {
      console.error("Failed to save auth info", e);
      showToast("Ошибка при входе в систему", "error");
    }
  };

  const logout = () => {
    try {
      const userName = user?.name;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      if (userName) {
        showToast(`До свидания, ${userName}!`, "success");
      }
    } catch (e) {
      console.error("Failed to remove auth info", e);
      showToast("Ошибка при выходе из системы", "error");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
}

export default AuthContext;
