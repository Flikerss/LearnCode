import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Toast from "../components/Toast/Toast";
import { apiRequest } from "../api/client";

export const AuthContext = createContext(null);

function getFriendlyErrorMessage(error, fallback) {
  const message = error?.message || fallback;
  const isNetworkError =
    !error?.status &&
    message &&
    ["Failed to fetch", "NetworkError when attempting to fetch resource"].some(
      (needle) => message.includes(needle)
    );

  if (isNetworkError) {
    return "Сервер недоступен. Проверьте подключение или повторите попытку позднее.";
  }

  return message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const handleAuthSuccess = useCallback(
    (nextUser, { silent = false, fallbackMessage } = {}) => {
      setUser(nextUser || null);
      if (!silent && nextUser?.name) {
        showToast(
          fallbackMessage || `Добро пожаловать, ${nextUser.name}!`,
          "success"
        );
      }
    },
    [showToast]
  );

  const fetchProfile = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const data = await apiRequest("/user/profile");
      setUser(data?.user || null);
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        setUser(null);
      } else {
        console.error("Не удалось получить профиль", error);
        showToast("Ошибка при проверке авторизации", "error");
      }
    } finally {
      setIsAuthLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(
    async ({ email, password }) => {
      try {
        const data = await apiRequest("/user/login", {
          method: "POST",
          body: { email, password },
        });
        handleAuthSuccess(data?.user, {
          fallbackMessage: data?.message,
        });
        return data;
      } catch (error) {
        const message = getFriendlyErrorMessage(error, "Ошибка входа");
        showToast(message, "error");
        throw error;
      }
    },
    [handleAuthSuccess, showToast]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      try {
        const data = await apiRequest("/user", {
          method: "POST",
          body: { name, email, password },
        });
        handleAuthSuccess(data?.user, { silent: true });
        showToast(data?.message || "Регистрация прошла успешно", "success");
        return data;
      } catch (error) {
        const message = getFriendlyErrorMessage(
          error,
          "Не удалось завершить регистрацию"
        );
        showToast(message, "error");
        throw error;
      }
    },
    [handleAuthSuccess, showToast]
  );

  const currentUserName = user?.name;

  const logout = useCallback(async () => {
    try {
      await apiRequest("/user/logout", { method: "POST" });
      setUser(null);
      if (currentUserName) {
        showToast(`До свидания, ${currentUserName}!`);
      }
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      } else {
        console.error("Не удалось выйти из системы", error);
        showToast(error?.message || "Ошибка при выходе", "error");
      }
    }
  }, [currentUserName, showToast]);

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      login,
      logout,
      register,
      refreshUser: fetchProfile,
    }),
    [fetchProfile, isAuthLoading, login, logout, register, user]
  );

  return (
    <AuthContext.Provider value={value}>
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
