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
import { SessionCard } from "@/features/sessions/SessionCard";
import { addRecentlyViewed } from "@/lib/recentlyViewed";
import { nextSevenDays, today } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { MovieDetail } from "@/types";

const chip = "text-label-s inline-flex h-6 items-center gap-1 rounded-full bg-white/15 px-3";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-overline text-muted">{label}</span>
      <span className="text-body-m">{value}</span>
    </div>
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

  // age gate: only for signed-in users with a known age; guests are checked after login
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
                "flex h-16 w-14 flex-col items-center justify-center rounded-xl text-xs font-semibold transition",
                active ? "bg-primary text-white" : "bg-surface text-muted",
                has ? "cursor-pointer hover:text-white" : "cursor-not-allowed opacity-40",
              )}
            >
              <span>{format(parseISO(d), "EEE")}</span>
              <span className="text-h3">{format(parseISO(d), "d")}</span>
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
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[104px] w-[252px] rounded-2xl" />
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
        <div className="flex flex-col gap-8">
          {query.data.map((group) => (
            <div key={group.venue.id} className="flex flex-col gap-3">
              <h3 className="text-h3">
                {group.venue.name}{" "}
                <span className="text-body-s text-muted">· {group.venue.city}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {group.sessions.map((s) => (
                  <SessionCard key={s.id} session={s} blockedReason={blocked} />
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
      <div className="mx-auto flex max-w-app gap-10 px-[70px] pt-[160px]" aria-busy="true">
        <Skeleton className="h-[420px] w-[280px] shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-32 w-full" />
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
      <div className="relative">
        <img
          src={movie.backdropUrl}
          alt=""
          className="absolute inset-x-0 top-0 h-[620px] w-full object-cover"
        />
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[linear-gradient(180deg,rgba(7,12,28,0.3)_0%,rgba(7,12,28,0.85)_70%,#070c1c_100%)]" />

        <div className="relative mx-auto flex max-w-app gap-10 px-[70px] pb-16 pt-[190px]">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="h-[420px] w-[280px] shrink-0 rounded-2xl object-cover shadow-modal"
          />

          <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
            <h1 className="text-display uppercase">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <AgeBadge
                code={movie.ageRating.code}
                description={movie.ageRating.description}
                className="h-6 px-3"
              />
              <span className={chip}>
                <ClockIcon className="h-3 w-3" /> {movie.runtimeMinutes} min
              </span>
              {movie.genres.map((g) => (
                <span key={g.id} className={chip}>
                  {g.name}
                </span>
              ))}
            </div>
            <p className="text-body-s text-muted">{movie.ageRating.description}</p>
            <p className="text-body-l max-w-[760px] text-white/90">{movie.synopsis}</p>

            <div className="mt-2 grid grid-cols-2 gap-x-12 gap-y-4">
              <Info label="Director" value={movie.director} />
              <Info
                label="Release date"
                value={format(parseISO(movie.releaseDate), "d MMMM yyyy")}
              />
              <Info label="Cast" value={movie.cast} />
              <Info
                label="Formats"
                value={
                  movie.formats.length ? movie.formats.map((f) => f.name).join(" · ") : "Standard"
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-app px-[70px] pb-16">
        <SessionsSection movie={movie} />
      </div>
    </div>
  );
}
