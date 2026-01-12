const RAW_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, "");
const API_BASE = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;
const DEBUG_MIN_DURATION = Number(import.meta.env.VITE_API_DEBUG_DELAY || 0);

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function buildHeaders(customHeaders = {}) {
  const headers = { ...customHeaders };
  if (!headers["Content-Type"] && !(customHeaders instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse response", error, text);
    throw new Error("Некорректный ответ сервера");
  }
}

export async function apiRequest(path, options = {}) {
  const { body, headers, credentials = "include", ...rest } = options;
  const fetchOptions = {
    method: options.method || "GET",
    headers: buildHeaders(headers),
    credentials,
    ...rest,
  };

  if (body !== undefined) {
    fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
    if (body instanceof FormData && fetchOptions.headers["Content-Type"]) {
      delete fetchOptions.headers["Content-Type"];
    }
  }

  const start = Date.now();
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  const url = path.startsWith("/api")
    ? `${BASE_URL}${apiPath}`
    : `${API_BASE}${apiPath}`;
  const response = await fetch(url, fetchOptions);
  const data = await parseResponse(response);
  if (DEBUG_MIN_DURATION > 0) {
    const elapsed = Date.now() - start;
    if (elapsed < DEBUG_MIN_DURATION) {
      await delay(DEBUG_MIN_DURATION - elapsed);
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.error || data?.message || response.statusText || "Request failed"
    );
    error.status = response.status;
    error.body = data;
    throw error;
  }

  return data;
}
