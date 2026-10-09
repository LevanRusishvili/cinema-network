import { Link } from "react-router-dom";
import { AgeBadge } from "./AgeBadge";
import { buttonClasses } from "@/components/ui/buttonClasses";
import { formatPrice, metaLine } from "@/lib/format";
import type { Movie } from "@/types";

export function MovieCardBig({ movie }: { movie: Movie }) {
  return (
    <Link
      to={`/movies/${movie.slug}`}
      className="flex h-[452px] w-[260px] shrink-0 flex-col gap-[10px] rounded-[20px] bg-surface p-3 shadow-card transition hover:-translate-y-1"
    >
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-surface-2">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="truncate text-base font-extrabold">{movie.title}</h3>
        <p className="text-body-s text-muted">{metaLine(movie)}</p>
        <AgeBadge
          code={movie.ageRating.code}
          description={movie.ageRating.description}
          className="self-start"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-label-m">From {formatPrice(movie.fromPrice)}</span>
        <span className={buttonClasses("primary", "sm")}>Buy Ticket</span>
      </div>
    </Link>
  );
}
