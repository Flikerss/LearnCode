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
  const body = { currentPassword, newPassword };
  if (userId) {
    body.userId = userId;
  }

  return apiRequest("/user/password", {
    method: "PUT",
    body,
  });
}

export function updateUserAvatar({ avatar, userId }) {
  const body = { avatar };
  if (userId) {
    body.userId = userId;
  }

  return apiRequest("/user/avatar", {
    method: "PUT",
    body,
  });
}
