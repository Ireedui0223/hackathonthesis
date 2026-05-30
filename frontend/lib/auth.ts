"use client";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "STUDENT" | "TEACHER";
  teacherType?: "MENTOR" | "CRITIQUE" | "BOTH" | null;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("thesis_token");
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("thesis_user");
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export function storeSession(token: string, user: StoredUser) {
  localStorage.setItem("thesis_token", token);
  localStorage.setItem("thesis_user", JSON.stringify(user));
}

export function logout() {
  localStorage.removeItem("thesis_token");
  localStorage.removeItem("thesis_user");
}

export function roleHome(role: StoredUser["role"]) {
  if (role === "ADMIN") return "/admin";
  if (role === "STUDENT") return "/student";
  return "/teacher";
}
