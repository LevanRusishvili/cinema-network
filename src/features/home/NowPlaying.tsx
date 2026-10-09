import { SectionHeader } from "./SectionHeader";
import { useNowPlaying } from "@/hooks/useMovies";
import { MovieCardBig } from "@/components/movie/MovieCardBig";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";

export function NowPlaying() {
  const { data, isLoading, isError, refetch } = useNowPlaying(10);

  return (
    <section className="flex flex-col gap-6 px-[70px]">
      <SectionHeader title="Now Playing" to="/sessions" />
      {isLoading ? (
        <div className="flex gap-[17px] overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[452px] w-[260px] shrink-0 rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState
          title="Nothing is playing right now"
          description="Check back soon, new films arrive every week."
        />
      ) : (
        <div className="no-scrollbar flex gap-[17px] overflow-x-auto py-1">
          {data.map((m) => (
            <MovieCardBig key={m.id} movie={m} />
          ))}
        </div>
      )}
    </section>
  );
}
