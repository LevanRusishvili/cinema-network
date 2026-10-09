import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { getMovie, getMovieSessions } from "@/api/endpoints/movies";
import { parseApiError } from "@/api/errors";
import { useAuthStore } from "@/stores/authStore";
import { AgeBadge } from "@/components/movie/AgeBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ClockIcon } from "@/components/ui/icons";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TicketSessionCard } from "./TicketSessionCard";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import { nextSevenDays, today } from "@/lib/date";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { MovieDetail, VenueSessions } from "@/types";

const chip = "text-label-s inline-flex h-6 items-center gap-1 rounded-full bg-white/15 px-3";

function byHall(sessions: VenueSessions["sessions"]) {
  const map = new Map<string, VenueSessions["sessions"]>();
  sessions.forEach((s) => map.set(s.hall.name, [...(map.get(s.hall.name) ?? []), s]));
  return [...map.entries()];
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-overline text-[11px] text-muted">{label}</dt>
      <dd className="text-label-m">{value}</dd>
    </div>
  );
}

function DetailsPanel({ movie }: { movie: MovieDetail }) {
  const { ageRating } = movie;
  return (
    <aside className="w-[388px] shrink-0">
      <h2 className="text-h1">Details</h2>
      <dl className="mt-4 flex flex-col gap-4">
        <Detail label="Director" value={movie.director} />
        <Detail label="Main cast" value={movie.cast} />
        <Detail label="Duration" value={`${movie.runtimeMinutes} minutes`} />
        <Detail label="Release date" value={format(parseISO(movie.releaseDate), "d MMMM yyyy")} />
        <Detail
          label="Formats"
          value={movie.formats.length ? movie.formats.map((f) => f.name).join(", ") : "Standard"}
        />
        <Detail label="From" value={formatPrice(movie.fromPrice)} />
      </dl>
      {ageRating.minAge > 0 && (
        <div className="mt-5 rounded-xl border border-warning/30 bg-warning/10 p-3">
          <p className="text-overline text-[11px] text-warning">Rating note</p>
          <p className="text-body-s mt-1">
            <b className="mr-2 text-warning">{ageRating.code}</b>
            {ageRating.description}
          </p>
        </div>
      )}
    </aside>
  );
}

function SessionsSection({ movie }: { movie: MovieDetail }) {
  const user = useAuthStore((s) => s.user);
  const days = nextSevenDays();
  const available = new Set(movie.availableDates);
  const firstAvailable = days.find((d) => available.has(d));

  const [selected, setSelected] = useState<string | null>(null);
  const date = selected ?? firstAvailable ?? today();

  const query = useQuery({
    queryKey: ["movie-sessions", movie.slug, date],
    queryFn: () => getMovieSessions(movie.slug, date),
    enabled: !movie.isComingSoon,
  });

  // age gate: only for signed-in users, guests are checked after login
  const blocked =
    user && user.age !== null && user.age < movie.ageRating.minAge
      ? `This film is rated ${movie.ageRating.code}. You cannot buy tickets for it with this account.`
      : undefined;

  if (movie.isComingSoon)
    return (
      <EmptyState
        title="Not in cinemas yet"
        description={`This film opens on ${format(parseISO(movie.releaseDate), "d MMMM yyyy")}. There are no sessions to book yet.`}
      />
    );

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-h1">Sessions</h2>

      <div className="flex gap-2">
        {days.map((d) => {
          const active = d === date;
          const has = available.has(d);
          return (
            <button
              key={d}
              type="button"
              disabled={!has}
              aria-pressed={active}
              title={has ? undefined : "No sessions on this day"}
              onClick={() => setSelected(d)}
              className={cn(
                "flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition",
                active ? "bg-primary text-white" : "bg-surface text-white",
                has ? "cursor-pointer hover:brightness-125" : "cursor-not-allowed opacity-40",
              )}
            >
              <span>{format(parseISO(d), "EEE")}</span>
              <span className="text-h2">{format(parseISO(d), "d")}</span>
            </button>
          );
        })}
      </div>

      {blocked && (
        <p role="alert" className="text-body-m rounded-xl bg-primary/10 px-4 py-3 text-primary">
          {blocked}
        </p>
      )}

      {query.isLoading ? (
        <div className="flex gap-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[140px] w-[300px] rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorState message={parseApiError(query.error).message} onRetry={() => query.refetch()} />
      ) : !query.data?.length ? (
        <EmptyState
          title="No sessions on this date"
          description="Pick another day above to see the showtimes."
          action={
            firstAvailable && firstAvailable !== date
              ? { label: "Go to first available day", onClick: () => setSelected(firstAvailable) }
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {query.data.map((group) => (
            <div key={group.venue.id}>
              <h3 className="text-label-m mb-3">{group.venue.name}</h3>
              <div className="flex flex-wrap gap-4">
                {byHall(group.sessions).map(([hall, list]) => (
                  <div key={hall} className="rounded-2xl bg-surface p-4">
                    <p className="text-label-s mb-3">Hall {hall}</p>
                    <div className="flex flex-wrap gap-3">
                      {list.map((s) => (
                        <TicketSessionCard key={s.id} session={s} blockedReason={blocked} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function MoviePage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const {
    data: movie,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["movie", slug],
    queryFn: () => getMovie(slug),
  });

  useEffect(() => {
    if (movie) addRecentlyViewed(movie);
  }, [movie]);

  if (isLoading)
    return (
      <div
        className="mx-auto flex max-w-app items-end gap-[34px] px-[60px] pt-[155px]"
        aria-busy="true"
      >
        <Skeleton className="h-[373px] w-[290px] shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-20 w-full max-w-xl" />
        </div>
      </div>
    );

  if (isError) {
    const { status, message } = parseApiError(error);
    return status === 404 ? (
      <EmptyState
        title="Film not found"
        description="This film does not exist or is no longer available."
        action={{ label: "Browse all sessions", onClick: () => navigate("/sessions") }}
      />
    ) : (
      <ErrorState message={message} onRetry={() => refetch()} />
    );
  }

  if (!movie) return null;

  return (
    <div className="-mt-[111px]">
      <section className="relative h-[569px] overflow-hidden">
        <img
          src={movie.backdropUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,12,28,0.25)_0%,rgba(7,12,28,0.55)_60%,#070c1c_100%)]" />

        <div className="relative mx-auto flex h-full max-w-app items-end gap-[34px] px-[60px] pb-10">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="h-[373px] w-[290px] shrink-0 rounded-2xl object-cover shadow-modal"
          />
          <div className="flex max-w-[620px] flex-col items-start gap-3">
            <span className="text-overline rounded-full bg-primary/15 px-3 py-1 text-primary">
              {movie.isComingSoon ? "Coming soon" : "Now playing"}
            </span>
            <h1 className="text-display uppercase">{movie.title}</h1>
            <p className="text-body-m text-white/90">{movie.synopsis}</p>
            <div className="flex flex-wrap items-center gap-2">
              <AgeBadge
                code={movie.ageRating.code}
                description={movie.ageRating.description}
                className="h-6 px-3"
              />
              <span className={chip}>
                <ClockIcon className="h-3 w-3" /> {movie.runtimeMinutes} Min
              </span>
              {movie.formats.map((f) => (
                <span key={f.id} className={chip}>
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-app gap-20 px-[52px] py-10">
        <div className="min-w-0 flex-1">
          <SessionsSection movie={movie} />
        </div>
        <DetailsPanel movie={movie} />
      </div>
    </div>
  );
}
