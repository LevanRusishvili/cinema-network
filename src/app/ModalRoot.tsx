import { useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
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
      return (
        <Modal onClose={closeAuth}>
          <h2 className="text-2xl font-semibold">Log In (placeholder)</h2>
        </Modal>
      );
    case "register":
      return (
        <Modal onClose={closeAuth}>
          <h2 className="text-2xl font-semibold">Sign Up (placeholder)</h2>
        </Modal>
      );
    case "booking":
      return (
        <Modal onClose={close} className="max-w-5xl">
          <h2 className="text-2xl font-semibold">Booking (placeholder)</h2>
        </Modal>
      );
    default:
      return null;
  }
}
