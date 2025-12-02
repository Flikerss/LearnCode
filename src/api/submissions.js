import { apiRequest } from "./client";

export async function createSubmission(payload) {
  if (!payload?.lessonId) {
    throw new Error("lessonId обязателен");
  }
  return apiRequest("/submissions", {
    method: "POST",
    body: payload,
  });
}

export async function fetchSubmissions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const path = query ? `/submissions?${query}` : "/submissions";
  return apiRequest(path);
}
