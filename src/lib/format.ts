import { format, parseISO } from "date-fns";
import type { Movie } from "@/types";

export const formatPrice = (n: number) => `₾ ${n}`;
export const shortDate = (iso: string) => format(parseISO(iso), "d MMM");
export const longDate = (iso: string) => format(parseISO(iso), "d MMMM");
export const metaLine = (m: Pick<Movie, "genres" | "runtimeMinutes">) =>
  [m.genres[0]?.name, `${m.runtimeMinutes} min`].filter(Boolean).join(" · ");
