import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

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

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };
type Replay = () => Promise<unknown>;

let onUnauthorized: ((replay: Replay) => Promise<unknown>) | null = null;
export const setUnauthorizedHandler = (fn: (replay: Replay) => Promise<unknown>) => {
  onUnauthorized = fn;
};

// 401 on these means "wrong credentials" or "stale token on boot", not "replay me"
const SILENT = ["/login", "/register", "/me", "/logout"];

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const silent = SILENT.some((p) => config?.url?.startsWith(p));
    if (error.response?.status === 401 && config && !config._retried && !silent && onUnauthorized) {
      tokenStorage.clear();
      return onUnauthorized(() => {
        config._retried = true;
        return api.request(config);
      });
    }
    return Promise.reject(error);
  },
);
