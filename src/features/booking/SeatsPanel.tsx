import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { priceOf, ratioLabel, ticketAllowed, type SelectedSeat } from "@/lib/seatRules";
import { cn } from "@/lib/cn";
import type { TicketType } from "@/types";

type Props = {
  selected: SelectedSeat[];
  types: TicketType[];
  basePrice: number;
  maxSeats: number;
  minAge: number;
  messages: string[];
  subtotal: number;
  nextDisabled: boolean;
  nextLoading: boolean;
  onType: (seatId: number, slug: string) => void;
  onRemove: (seatId: number) => void;
  onNext: () => void;
};

export function SeatsPanel(p: Props) {
  const sorted = [...p.types].sort((a, b) => a.priceRatio - b.priceRatio);

  return (
    <aside className="flex min-h-0 flex-col border-l border-white/5 pl-6">
      <h3 className="text-label-m">Your seats · Max {p.maxSeats}</h3>

      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
        {p.selected.length === 0 && (
          <p className="text-body-s text-muted">
            Pick up to {p.maxSeats} seats from the map. Each seat can carry its own ticket type.
          </p>
        )}
        {p.selected.map((s) => {
          const current = p.types.find((t) => t.slug === s.ticketType);
          return (
            <div key={s.seatId} className="rounded-xl bg-surface p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">
                  Seat <b className="ml-1 text-white">{s.code}</b>
                </span>
                <span className="flex items-center gap-3">
                  <b>{formatPrice(priceOf(p.basePrice, current?.priceRatio ?? 1))}</b>
                  <button
                    type="button"
                    aria-label={`Remove seat ${s.code}`}
                    onClick={() => p.onRemove(s.seatId)}
                    className="cursor-pointer text-muted hover:text-white"
                  >
                    ✕
                  </button>
                </span>
              </div>
              <div className="mt-2 flex gap-2 border-t border-white/5 pt-2">
                {sorted
                  .filter((t) => ticketAllowed(t, p.minAge))
                  .map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      aria-pressed={t.slug === s.ticketType}
                      onClick={() => p.onType(s.seatId, t.slug)}
                      className={cn(
                        "flex-1 cursor-pointer rounded-full py-1.5 text-[11px] font-semibold transition",
                        t.slug === s.ticketType
                          ? "bg-primary text-white"
                          : "bg-surface-2 text-white/80 hover:text-white",
                      )}
                    >
                      {ratioLabel(t)}
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div aria-live="polite" className="flex flex-col gap-1">
          {p.messages.map((m) => (
            <p key={m} role="alert" className="text-body-s text-danger">
              {m}
            </p>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-overline text-[11px]">Subtotal</span>
          <span className="text-h1">{formatPrice(p.subtotal)}</span>
        </div>
        <Button
          className="w-full"
          disabled={p.nextDisabled}
          loading={p.nextLoading}
          onClick={p.onNext}
        >
          Next: Checkout
        </Button>
      </div>
    </aside>
  );
}
