import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Session } from "@/types";

type Props = { session: Omit<Session, "movie">; blockedReason?: string };

export function TicketSessionCard({ session, blockedReason }: Props) {
  const requireAuth = useAuthStore((s) => s.requireAuth);
  const openModal = useModalStore((s) => s.open);
  const soldOut = session.isSoldOut;
  const disabled = soldOut || !!blockedReason;

  return (
    <button
      type="button"
      disabled={disabled}
      title={blockedReason ?? (soldOut ? "Sold out" : undefined)}
      onClick={() => requireAuth(() => openModal({ type: "booking", sessionId: session.id }))}
      className={cn(
        "flex h-[82px] w-[208px] overflow-hidden rounded-xl bg-bg text-left transition",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:brightness-125",
      )}
    >
      <span className="flex w-[122px] flex-col justify-center gap-1.5 px-3">
        <span className="text-h3">{session.time}</span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted">
          {session.language.code}
          <span className="rounded-full bg-surface-2 px-2 py-0.5 font-semibold text-white">
            {session.format.name}
          </span>
        </span>
      </span>
      <span className="flex flex-1 flex-col items-center justify-center gap-1 border-l border-dashed border-white/40">
        <span className="text-h3 text-primary">{formatPrice(session.price)}</span>
        <span className="text-[10px] text-muted">
          {soldOut ? "Sold out" : `${session.seatsLeft} left`}
        </span>
      </span>
    </button>
  );
}
