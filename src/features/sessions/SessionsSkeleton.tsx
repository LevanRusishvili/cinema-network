import { Skeleton } from "@/components/ui/Skeleton";

export function SessionsSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      {Array.from({ length: 3 }, (_, g) => (
        <div key={g} className="flex flex-col gap-[14px]">
          <div className="flex h-20 items-center gap-4">
            <Skeleton className="h-20 w-14" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-[104px] w-[252px] shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
