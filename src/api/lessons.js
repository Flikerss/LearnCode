import { apiRequest } from "./client";

export async function fetchLessons(options = {}) {
  return apiRequest("/lessons", { method: "GET", ...options });
}

export async function fetchLessonById(id, options = {}) {
  return apiRequest(`/lessons/${id}`, { method: "GET", ...options });
}

export async function createLesson(payload, options = {}) {
  return apiRequest("/lessons", {
    method: "POST",
    body: payload,
    ...options,
  });
}

export async function updateLesson(id, payload, options = {}) {
  return apiRequest(`/lessons/${id}`, {
    method: "PUT",
    body: payload,
    ...options,
  });
}

export async function deleteLesson(id, options = {}) {
  return apiRequest(`/lessons/${id}`, {
    method: "DELETE",
    ...options,
  });
}
