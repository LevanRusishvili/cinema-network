import { create } from "zustand";
import { getMe, logout as logoutRequest } from "@/api/endpoints/auth";
import { setUnauthorizedHandler, tokenStorage } from "@/api/client";
import { queryClient } from "@/lib/queryClient";
import { useModalStore } from "./modalStore";
import type { AuthResponse, User } from "@/types";

type Pending = { run: () => void; cancel: () => void };

type AuthStore = {
  user: User | null;
  ready: boolean; // false until the boot /me check finishes
  pending: Pending | null; // the action to continue after login
  init: () => Promise<void>;
  completeAuth: (data: AuthResponse) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  requireAuth: (action: () => void) => void;
  cancelPending: () => void;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  ready: false,
  pending: null,

  init: async () => {
    if (!tokenStorage.get()) return set({ ready: true });
    try {
      set({ user: await getMe(), ready: true });
    } catch {
      tokenStorage.clear(); // stale token, so we are a guest
      set({ user: null, ready: true });
    }
  },

  completeAuth: ({ user, token }) => {
    tokenStorage.set(token);
    const { pending } = get();
    set({ user, pending: null });
    useModalStore.getState().close();
    pending?.run(); // continue the protected action automatically
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    try {
      await logoutRequest();
    } catch {
      // clear locally regardless of the response
    }
    tokenStorage.clear();
    queryClient.clear();
    set({ user: null, pending: null });
  },

  requireAuth: (action) => {
    if (get().user) return action();
    set({ pending: { run: action, cancel: () => {} } });
    useModalStore.getState().open({ type: "login" });
  },

  cancelPending: () => {
    get().pending?.cancel();
    set({ pending: null });
  },
}));

// 401 from any protected request: open login, then replay the request
setUnauthorizedHandler(
  (replay) =>
    new Promise((resolve, reject) => {
      useAuthStore.setState({
        user: null,
        pending: {
          run: () => replay().then(resolve, reject),
          cancel: () => reject(new Error("AuthCancelled")),
        },
      });
      useModalStore.getState().open({ type: "login" });
    }),
);
