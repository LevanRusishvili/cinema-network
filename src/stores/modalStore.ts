import { create } from "zustand";

export type ModalState =
  | { type: null }
  | { type: "login" }
  | { type: "register" }
  | { type: "booking"; sessionId: number };

type ModalStore = {
  modal: ModalState;
  open: (modal: Exclude<ModalState, { type: null }>) => void;
  close: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modal: { type: null },
  open: (modal) => set({ modal }),
  close: () => set({ modal: { type: null } }),
}));
