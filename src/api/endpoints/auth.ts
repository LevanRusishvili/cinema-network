import { api } from "../client";
import type { AuthResponse, User } from "@/types";

export const login = (body: { email: string; password: string }) =>
  api.post<{ data: AuthResponse }>("/login", body).then((r) => r.data.data);

export const register = (form: FormData) =>
  api.post<{ data: AuthResponse }>("/register", form).then((r) => r.data.data);

export const logout = () => api.post("/logout");
export const getMe = () => api.get<{ data: User }>("/me").then((r) => r.data.data);
