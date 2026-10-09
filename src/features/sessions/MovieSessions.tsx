import { Link } from "react-router-dom";
import { AgeBadge } from "@/components/movie/AgeBadge";
import { SessionCard } from "./SessionCard";
import type { SessionGroup } from "@/types";

export function MovieSessions({ group }: { group: SessionGroup }) {
  const { movie, sessions } = group;
  return (
    <section className="flex flex-col gap-[14px] border-b border-surface-2 pb-8 last:border-0 last:pb-0">
      <Link to={`/movies/${movie.slug}`} className="flex h-20 w-fit items-center gap-4">
        <img
          src={movie.posterUrl}
          alt=""
          loading="lazy"
          className="h-20 w-14 rounded-lg object-cover"
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-h3">{movie.title}</h2>
            <AgeBadge code={movie.ageRating.code} description={movie.ageRating.description} />
          </div>
          <p className="text-body-s text-muted">{movie.runtimeMinutes} min</p>
        </div>
      </Link>
      <div className="no-scrollbar flex gap-3 overflow-x-auto">
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </section>
  );
}
