import { apiRequest } from "./client";

export async function fetchLessons(options = {}) {
  return apiRequest("/lessons", { method: "GET", ...options });
}

export async function fetchLessonById(id, options = {}) {
  return apiRequest(`/lessons/${id}`, { method: "GET", ...options });
}
