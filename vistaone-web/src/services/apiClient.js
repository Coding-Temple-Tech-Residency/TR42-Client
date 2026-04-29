import { API_BASE } from "../config/api";

export function authFetch(url, options = {}) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("Missing auth token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  headers.Authorization = `Bearer ${token}`;

  return fetch(API_BASE + url, {
    ...options,
    headers
  });
}