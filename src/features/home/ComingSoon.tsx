import { SectionHeader } from "./SectionHeader";
import { useComingSoon } from "@/hooks/useMovies";
import { MovieCardMedium } from "@/components/movie/MovieCardMedium";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { EmptyState } from "@/components/feedback/EmptyState";

export function ComingSoon() {
  const { data, isLoading, isError, refetch } = useComingSoon(10);

  return (
    <section className="flex flex-col gap-6 px-[70px]">
      <SectionHeader title="Coming Soon..." />
      {isLoading ? (
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[160px] w-[470px] shrink-0 rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState title="No upcoming films yet" description="New releases will show up here." />
      ) : (
        <div className="no-scrollbar flex gap-5 overflow-x-auto py-1">
          {data.map((m) => (
            <MovieCardMedium key={m.id} movie={m} />
          ))}
        </div>
      )}
    </section>
  );
}
