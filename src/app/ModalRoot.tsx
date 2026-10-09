import { useCallback } from "react";
import { LoginModal } from "@/features/auth/LoginModal";
import { RegisterModal } from "@/features/auth/RegisterModal";
import { BookingModal } from "@/features/booking/BookingModal";
import { useModalStore } from "@/stores/modalStore";
import { useAuthStore } from "@/stores/authStore";

export function ModalRoot() {
  const modal = useModalStore((s) => s.modal);
  const close = useModalStore((s) => s.close);

  const closeAuth = useCallback(() => {
    useAuthStore.getState().cancelPending();
    close();
  }, [close]);

  switch (modal.type) {
    case "login":
      return <LoginModal onClose={closeAuth} />;
    case "register":
      return <RegisterModal onClose={closeAuth} />;
    case "booking":
      return <BookingModal key={modal.sessionId} sessionId={modal.sessionId} onClose={close} />;
    default:
      return null;
  }
}
