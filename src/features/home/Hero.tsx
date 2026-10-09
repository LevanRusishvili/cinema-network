import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFeatured } from "@/hooks/useMovies";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/Button";
import { AgeBadge } from "@/components/movie/AgeBadge";
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, TicketIcon } from "@/components/ui/icons";
import { shortDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Movie } from "@/types";

const SLIDE_MS = 6000;
const chip =
  "text-label-s inline-flex h-6 items-center gap-1 rounded-full bg-white/15 px-3 backdrop-blur";

function HeroSlider({ movies }: { movies: Movie[] }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = movies.length;
  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  return (
    <section
      className="relative h-[760px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {movies.map((movie, i) => {
        const active = i === index;
        return (
          <div
            key={movie.id}
            aria-hidden={!active}
            inert={!active}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              active ? "opacity-100" : "opacity-0",
            )}
          >
            <img
              src={movie.backdropUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.8)_100%)]" />

            <div className="relative z-10 mx-auto h-full max-w-app">
              <div className="absolute left-[67px] top-[325px] flex w-[580px] flex-col items-start gap-[15px]">
                <span className="text-overline rounded-full bg-primary/15 px-3 py-1 text-primary">
                  Premiere · {shortDate(movie.releaseDate)}
                </span>
                <h2 className="text-display uppercase">{movie.title}</h2>
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
                <p className="text-body-m line-clamp-3 text-white/90">{movie.synopsis}</p>
                <div className="flex gap-3">
                  <Button size="hero" onClick={() => navigate(`/movies/${movie.slug}`)}>
                    <TicketIcon /> Buy tickets
                  </Button>
                  <Button size="hero" variant="dark" onClick={() => navigate("/sessions")}>
                    All sessions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-[42px] z-20">
          <div className="mx-auto flex h-[54px] max-w-app items-center gap-5 px-[67px]">
            <div className="flex flex-1 gap-4">
              {movies.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  aria-label={`Show ${m.title}`}
                  onClick={() => setIndex(i)}
                  className="flex h-6 flex-1 cursor-pointer items-center"
                >
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/80">
                    {i === index && (
                      <span
                        className="absolute inset-y-0 left-0 block bg-primary"
                        style={{
                          animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                        onAnimationEnd={next}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-2/80 hover:bg-surface-2"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface-2/80 hover:bg-surface-2"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function Hero() {
  const { data, isLoading, isError, refetch } = useFeatured();

  if (isLoading) return <Skeleton className="h-[760px] w-full rounded-none" />;
  if (isError)
    return (
      <div className="flex h-[760px] items-center justify-center">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  if (!data?.length) return <div className="h-[111px]" />; // keeps room for the navbar
  return <HeroSlider movies={data} />;
}
