import { apiRequest } from "./client";

export function updateUserName({ userId, name }) {
  if (!userId) {
    return Promise.reject(new Error("Не удалось определить пользователя"));
  }

  return apiRequest(`/user/${userId}`, {
    method: "PUT",
    body: { name },
  });
}

export function updateUserPassword({ currentPassword, newPassword, userId }) {
  return apiRequest("/user/password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });
}

export function updateUserAvatar({ avatar, userId }) {
  return apiRequest("/user/avatar", {
    method: "PUT",
    body: { avatar },
  });
}
