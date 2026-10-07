import axios, { AxiosError } from "axios";

const TOKEN_KEY = "token";
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// authStore registers this later; keeps the client free of circular imports
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const isLogin = error.config?.url?.includes("/login");
    if (error.response?.status === 401 && !isLogin) {
      tokenStorage.clear();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
