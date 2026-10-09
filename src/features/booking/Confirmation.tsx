import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { ticketSummary } from "@/lib/seatRules";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types";

type Props = { order: Order; onViewTickets: () => void; onHome: () => void };

export function Confirmation({ order, onViewTickets, onHome }: Props) {
  const s = order.session;
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center gap-3 py-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success text-bg">
        <CheckIcon className="h-6 w-6" strokeWidth={3} />
      </span>
      <h2 className="text-h1">Booking confirmed!</h2>
      <p className="text-body-s max-w-xs text-muted">
        Your tickets are ready. We&apos;ve sent the confirmation to your email.
      </p>
      <span className="text-overline rounded-full bg-surface px-4 py-1.5 text-[11px]">
        Order #{order.reference}
      </span>

      <div className="mt-2 w-full max-w-[560px] rounded-xl bg-surface p-4 text-left">
        <div className="flex items-center gap-3">
          <img src={s.movie.posterUrl} alt="" className="h-12 w-9 rounded object-cover" />
          <div>
            <p className="text-label-m uppercase">{s.movie.title}</p>
            <p className="text-body-s text-muted">
              {s.venue.name} · Hall {s.hall.name} · {format(parseISO(s.date), "EEE d MMM")} ·{" "}
              {s.time}
            </p>
          </div>
        </div>
        <dl className="text-body-s mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
          <div className="flex justify-between">
            <dt className="text-muted">Seats</dt>
            <dd className="text-label-s">{order.tickets.map((t) => t.seatCode).join(", ")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Tickets</dt>
            <dd className="text-label-s">
              {ticketSummary(order.tickets.map((t) => t.ticketType.name))}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <dt className="text-overline text-[11px] text-muted">Total paid</dt>
            <dd className="text-h2">{formatPrice(order.totalPrice)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-2 flex gap-3">
        <Button onClick={onViewTickets}>View my tickets</Button>
        <Button variant="dark" onClick={onHome}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
