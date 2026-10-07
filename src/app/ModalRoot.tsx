import { useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { LoginModal } from "@/features/auth/LoginModal";
import { RegisterModal } from "@/features/auth/RegisterModal";
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
      return (
        <Modal onClose={close} className="max-w-[1100px]">
          <h2 className="text-h2">Booking (placeholder)</h2>
        </Modal>
      );
    default:
      return null;
  }
}
