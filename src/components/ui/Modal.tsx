import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Props = { onClose: () => void; children: ReactNode; className?: string };

export function Modal({ onClose, children, className }: Props) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose; // ყოველი რენდერის შემდეგ ახლდება, რენდერის დროს კი არა
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative max-h-[90vh] w-full max-w-[420px] overflow-y-auto rounded-2xl bg-bg p-6 shadow-2xl",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-white"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}
