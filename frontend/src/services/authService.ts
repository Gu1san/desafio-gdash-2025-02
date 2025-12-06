// services/authService.ts
import api from "./api";

export async function loginRequest(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data; // { access_token }
}

export async function fetchUserProfile() {
  const res = await api.get("/users/me");
  return res.data;
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function getToken() {
  return localStorage.getItem("token") ?? null;
}

export function saveUser(user: any) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function loadUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem("user");
}
