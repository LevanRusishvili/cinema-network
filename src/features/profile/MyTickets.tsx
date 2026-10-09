import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getTickets } from "@/api/endpoints/tickets";
import { parseApiError } from "@/api/errors";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { cn } from "@/lib/cn";
import { TicketCard } from "./TicketCard";

type Sub = "upcoming" | "past";

export function MyTickets() {
  const navigate = useNavigate();
  const [sub, setSub] = useState<Sub>("upcoming");

  const query = useQuery({ queryKey: ["tickets"], queryFn: () => getTickets() });
  const all = query.data ?? [];
  const upcoming = all.filter((o) => o.isUpcoming && o.status === "paid");
  const past = all.filter((o) => !(o.isUpcoming && o.status === "paid"));
  const list = sub === "upcoming" ? upcoming : past;

  const pill = (id: Sub, label: string, count: number) => (
    <button
      type="button"
      onClick={() => setSub(id)}
      className={cn(
        "text-label-m flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 transition",
        sub === id ? "bg-surface-2 text-white" : "text-muted hover:text-white",
      )}
    >
      {label} <span className="text-[11px]">{count}</span>
    </button>
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex w-fit gap-1 rounded-2xl bg-surface p-1">
        {pill("upcoming", "Upcoming", upcoming.length)}
        {pill("past", "Past", past.length)}
      </div>

      {query.isLoading ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-[150px] w-full rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState message={parseApiError(query.error).message} onRetry={() => query.refetch()} />
      ) : list.length === 0 ? (
        sub === "upcoming" ? (
          <EmptyState
            title="No upcoming tickets"
            description="Book a film and your tickets will show up here."
            action={{ label: "Browse sessions", onClick: () => navigate("/sessions") }}
          />
        ) : (
          <EmptyState
            title="No past tickets"
            description="Watched and refunded tickets will appear here."
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((o) => (
            <TicketCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </section>
  );
}
