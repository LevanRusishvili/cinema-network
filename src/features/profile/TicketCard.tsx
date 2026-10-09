import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subHours } from "date-fns";
import { AgeBadge } from "@/components/movie/AgeBadge";
import { Button } from "@/components/ui/Button";
import { refundOrder } from "@/api/endpoints/tickets";
import { parseApiError } from "@/api/errors";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types";

const Label = ({ children }: { children: string }) => (
  <p className="text-overline text-[11px] text-muted">{children}</p>
);

export function TicketCard({ order }: { order: Order }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const s = order.session;
  const refunded = order.status !== "paid";

  const refund = useMutation({
    mutationFn: () => refundOrder(order.reference),
    onSuccess: () => {
      setConfirming(false);
      // the card moves tabs because the server says so, not because we hide it
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["movie-sessions"] });
    },
    onError: (e) => {
      if (e instanceof Error && e.message === "AuthCancelled") return;
      setConfirming(false);
      setError(parseApiError(e).message);
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const cutoff = format(subHours(parseISO(s.startsAt), 2), "HH:mm, EEE d MMM");

  return (
    <article className="flex overflow-hidden rounded-2xl bg-surface">
      <img src={s.movie.posterUrl} alt="" className="h-[150px] w-[100px] shrink-0 object-cover" />

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <h3 className="text-h3 truncate uppercase">{s.movie.title}</h3>
          <AgeBadge code={s.movie.ageRating.code} description={s.movie.ageRating.description} />
          <span className="text-body-s text-muted">{s.movie.runtimeMinutes} min</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Date</Label>
            <p className="text-label-m">
              {format(parseISO(s.date), "EEE d MMM")} · {s.time}
            </p>
          </div>
          <div>
            <Label>Venue</Label>
            <p className="text-label-m">
              {s.venue.name} · Hall {s.hall.name}
            </p>
          </div>
          <div>
            <Label>Format</Label>
            <p className="text-label-m">
              {s.format.name} · {s.language.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Label>Seats</Label>
          {order.tickets.map((t) => (
            <span key={t.id} className="text-label-s rounded-md bg-bg px-2 py-1">
              {t.seatCode} · {t.ticketType.name}
            </span>
          ))}
        </div>
      </div>

      <div className="flex w-[240px] shrink-0 flex-col justify-between gap-3 border-l border-dashed border-white/20 p-4">
        <div>
          <Label>Order</Label>
          <p className="text-label-m">#{order.reference}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-s text-muted">Total paid</span>
          <span className="text-h2">{formatPrice(order.totalPrice)}</span>
        </div>

        {order.isUpcoming && !refunded ? (
          confirming ? (
            <div className="flex flex-col gap-2">
              <p className="text-body-s text-muted">Refund this order? This cannot be undone.</p>
              <div className="flex gap-2">
                <Button size="sm" loading={refund.isPending} onClick={() => refund.mutate()}>
                  Yes, refund
                </Button>
                <Button
                  size="sm"
                  variant="dark"
                  disabled={refund.isPending}
                  onClick={() => setConfirming(false)}
                >
                  Keep
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button
                variant="dark"
                size="sm"
                disabled={!order.isRefundable}
                title={
                  order.isRefundable
                    ? undefined
                    : "Refunds close 2 hours before the session starts."
                }
                onClick={() => {
                  setError("");
                  setConfirming(true);
                }}
              >
                Refund
              </Button>
              <p className="text-body-s text-center text-muted">
                {order.isRefundable
                  ? `Refundable until ${cutoff}`
                  : "Refunds closed 2 hours before the session."}
              </p>
            </>
          )
        ) : (
          <p className="text-label-s text-center text-muted">{refunded ? "Refunded" : "Watched"}</p>
        )}
        {error && (
          <p role="alert" className="text-body-s text-danger">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
