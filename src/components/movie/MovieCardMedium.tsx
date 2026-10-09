import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AgeBadge } from "./AgeBadge";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonClasses";
import { BellIcon, CheckIcon } from "@/components/ui/icons";
import { notifyMe } from "@/api/endpoints/movies";
import { useAuthStore } from "@/stores/authStore";
import { longDate, metaLine } from "@/lib/format";
import type { Movie } from "@/types";

export function MovieCardMedium({ movie }: { movie: Movie }) {
  const requireAuth = useAuthStore((s) => s.requireAuth);
  const queryClient = useQueryClient();
  const notify = useMutation({
    mutationFn: () => notifyMe(movie.slug),
    // the state comes back from the server, not patched locally
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movies", "coming-soon"] }),
  });

  const cancelled = notify.error instanceof Error && notify.error.message === "AuthCancelled";
  const failed = notify.isError && !cancelled;
  const to = `/movies/${movie.slug}`;

  return (
    <article className="flex h-[160px] w-[470px] shrink-0 gap-[15px] rounded-[20px] bg-surface p-3 shadow-card">
      <Link to={to} className="w-[136px] shrink-0 overflow-hidden rounded-xl bg-surface-2">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
        <p className="text-overline text-primary">In cinemas {longDate(movie.releaseDate)}</p>
        <Link to={to} className="text-h3 max-w-full truncate">
          {movie.title}
        </Link>
        <p className="text-body-s text-muted">{metaLine(movie)}</p>
        <AgeBadge code={movie.ageRating.code} description={movie.ageRating.description} />

        {movie.isNotified ? (
          <span className={buttonClasses("dark", "sm", "mt-auto")}>
            <CheckIcon /> Reminder set
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-auto"
            loading={notify.isPending}
            onClick={() => requireAuth(() => notify.mutate())}
          >
            <BellIcon /> {failed ? "Try again" : "Notify Me"}
          </Button>
        )}
      </div>
    </article>
  );
}
