import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { Seat, SeatMap } from "@/types";

export type SeatStatus = "available" | "selected" | "sold" | "held" | "unavailable";

type Props = {
  map: SeatMap;
  statusOf: (seat: Seat) => SeatStatus;
  onToggle: (seat: Seat) => void;
};

const seatBase =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-extrabold transition";

const STRIPES =
  "bg-surface bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.14)_0_4px,transparent_4px_8px)]";

const styles: Record<Exclude<SeatStatus, "unavailable">, string> = {
  available: "cursor-pointer border-white/20 bg-surface hover:border-white/60",
  selected: "cursor-pointer border-primary bg-primary text-white",
  sold: "cursor-not-allowed border-transparent bg-surface/40 text-subtle",
  held: `cursor-not-allowed border-white/15 text-muted ${STRIPES}`,
};

const LEGEND = [
  { label: "Available", swatch: "border border-white/30 bg-surface" },
  { label: "Selected", swatch: "bg-primary" },
  { label: "Sold", swatch: "bg-surface/40" },
  { label: "Held by another user", swatch: `border border-white/20 ${STRIPES}` },
];

export function SeatGrid({ map, statusOf, onToggle }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="rounded-lg bg-surface-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider">
        Screen
      </div>

      <div className="no-scrollbar flex flex-col gap-6 overflow-x-auto">
        {map.sections.map((section) => {
          const first = section.rows[0]?.label;
          const last = section.rows[section.rows.length - 1]?.label;
          return (
            <div key={section.name} className="mx-auto flex flex-col gap-2">
              <h3 className="text-overline text-[11px] text-muted">
                {section.name} · Rows {first}
                {last && last !== first ? `-${last}` : ""}
              </h3>
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="w-4 text-[11px] text-muted">{row.label}</span>
                  <div className="flex gap-1.5">
                    {row.seats.map((seat) => {
                      const status = statusOf(seat);
                      return (
                        <Fragment key={seat.id}>
                          {status === "unavailable" ? (
                            <span aria-hidden className="h-10 w-10 shrink-0" />
                          ) : (
                            <button
                              type="button"
                              aria-label={`Seat ${seat.code}, ${status}`}
                              aria-pressed={status === "selected"}
                              disabled={status === "sold" || status === "held"}
                              onClick={() => onToggle(seat)}
                              className={cn(seatBase, styles[status])}
                            >
                              {seat.label}
                            </button>
                          )}
                          {seat.aisleAfter && <span aria-hidden className="w-5 shrink-0" />}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <ul className="mt-auto flex flex-wrap items-center justify-center gap-5 text-[11px] text-muted">
        {LEGEND.map((l) => (
          <li key={l.label} className="flex items-center gap-2">
            <span className={cn("h-3.5 w-3.5 rounded", l.swatch)} /> {l.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
