import { MovieCardSmall } from "@/components/movie/MovieCardSmall";
import type { RecentMovie } from "@/lib/recentlyViewed";

export function RecentlyViewed({ items }: { items: RecentMovie[] }) {
  return (
    <section className="flex flex-col gap-4 px-[70px]">
      <h2 className="text-h3">Recently viewed</h2>
      <div className="no-scrollbar flex gap-4 overflow-x-auto">
        {items.map((m) => (
          <MovieCardSmall key={m.id} movie={m} />
        ))}
      </div>
    </section>
  );
}
