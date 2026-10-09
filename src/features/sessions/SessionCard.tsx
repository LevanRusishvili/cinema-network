import { TicketIcon } from "@/components/ui/icons";
import { useAuthStore } from "@/stores/authStore";
import { useModalStore } from "@/stores/modalStore";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Session } from "@/types";

const LOW_SEATS = 5;

type Props = {
  session: Omit<Session, "movie">;
  blockedReason?: string;
};

export function SessionCard({ session, blockedReason }: Props) {
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
        "flex h-[104px] w-[252px] shrink-0 flex-col justify-between rounded-2xl bg-surface p-3 text-left transition",
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-surface-2",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-h3">{session.time}</span>
        <span className="text-label-s rounded-full bg-bg px-3 py-1">{session.format.name}</span>
      </div>
      <div className="text-body-s flex items-center justify-between text-muted">
        <span className="truncate">{session.language.name}</span>
        {soldOut ? (
          <span>Sold out</span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              session.seatsLeft <= LOW_SEATS ? "text-danger" : "text-success",
            )}
          >
            <TicketIcon className="h-3 w-3" /> {session.seatsLeft} left
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-label-s truncate">
          {session.venue.name} · Hall {session.hall.name}
        </span>
        <span className="text-label-m">{formatPrice(session.price)}</span>
      </div>
    </button>
  );
}
