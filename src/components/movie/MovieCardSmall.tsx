import { Link } from "react-router-dom";
import { AgeBadge } from "./AgeBadge";
import type { RecentMovie } from "@/lib/recentlyViewed";

export function MovieCardSmall({ movie }: { movie: RecentMovie }) {
  return (
    <Link
      to={`/movies/${movie.slug}`}
      className="flex h-[87px] w-[329px] shrink-0 items-center gap-3 rounded-2xl bg-surface p-[10px] transition hover:brightness-125"
    >
      <img
        src={movie.posterUrl}
        alt={movie.title}
        loading="lazy"
        className="h-[67px] w-[67px] shrink-0 rounded-lg object-cover"
      />
      <div className="flex min-w-0 flex-col items-start gap-1">
        <p className="text-label-m w-full truncate uppercase">{movie.title}</p>
        <p className="text-body-s text-muted">{movie.meta}</p>
        <AgeBadge code={movie.ageRating.code} description={movie.ageRating.description} />
      </div>
    </Link>
  );
}
