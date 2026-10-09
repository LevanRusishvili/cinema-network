import type { TicketType } from "@/types";

export type SelectedSeat = { seatId: number; code: string; ticketType: string };

export const priceOf = (base: number, ratio: number) => Math.round(base * ratio * 100) / 100;

// child is blocked from 16+ and the exact number comes from /filter-options
export const ticketAllowed = (type: TicketType, minAge: number) =>
  type.blockedFromRatingAge === null || minAge < type.blockedFromRatingAge;

export const ratioLabel = (t: TicketType) => `${t.name} ${Math.round(t.priceRatio * 100)}%`;

export function seatViolations(
  selected: SelectedSeat[],
  types: TicketType[],
  minAge: number,
  max: number,
) {
  const out: string[] = [];
  if (selected.length > max) out.push(`You can select up to ${max} seats per order.`);
  selected.forEach((s) => {
    const t = types.find((x) => x.slug === s.ticketType);
    if (t && !ticketAllowed(t, minAge))
      out.push(`Seat ${s.code}: ${t.name} tickets are not available for this film.`);
  });
  return out;
}

export function subtotalOf(selected: SelectedSeat[], types: TicketType[], base: number) {
  const total = selected.reduce((sum, s) => {
    const ratio = types.find((t) => t.slug === s.ticketType)?.priceRatio ?? 1;
    return sum + priceOf(base, ratio);
  }, 0);
  return Math.round(total * 100) / 100;
}

// ["Adult","Adult","Child"] -> "2 x Adult, 1 x Child"
export function ticketSummary(names: string[]) {
  const counts = new Map<string, number>();
  names.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1));
  return [...counts.entries()].map(([n, c]) => `${c} x ${n}`).join(", ");
}
