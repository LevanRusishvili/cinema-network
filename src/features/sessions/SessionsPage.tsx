import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSessions, type SessionsParams } from "@/api/endpoints/sessions";
import { parseApiError } from "@/api/errors";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { FiltersPanel } from "./FiltersPanel";
import { SortDropdown } from "./SortDropdown";
import { MovieSessions } from "./MovieSessions";
import { SessionsSkeleton } from "./SessionsSkeleton";
import { useSessionFilters } from "./useSessionFilters";

const orUndefined = <T,>(list: T[]) => (list.length ? list : undefined);

export default function SessionsPage() {
  const { filters, update, clearAll, activeCount } = useSessionFilters();
  const options = useFilterOptions();

  const params = useMemo<SessionsParams>(
    () => ({
      date: filters.date,
      venues: orUndefined(filters.venues),
      formats: orUndefined(filters.formats),
      languages: orUndefined(filters.languages),
      bands: orUndefined(filters.bands),
      search: filters.search || undefined,
      sort: filters.sort,
      page: filters.page,
    }),
    [filters],
  );

  // no placeholderData on purpose: a filter change shows the skeleton again
  const query = useQuery({ queryKey: ["sessions", params], queryFn: () => getSessions(params) });
  const groups = query.data?.data ?? [];
  const meta = query.data?.meta;

  const goToPage = (page: number) => {
    update({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const countText = query.isLoading
    ? "Loading sessions…"
    : !meta || meta.totalSessions === 0
      ? "No sessions found"
      : `Showing ${meta.totalSessions} ${meta.totalSessions === 1 ? "session" : "sessions"}`;

  let content;
  if (query.isLoading) {
    content = <SessionsSkeleton />;
  } else if (query.isError) {
    content = (
      <ErrorState message={parseApiError(query.error).message} onRetry={() => query.refetch()} />
    );
  } else if (groups.length === 0) {
    content = (
      <EmptyState
        title="No sessions found"
        description={
          filters.page > 1
            ? "This page is out of range."
            : "Nothing matches these filters on this date. Try another date or clear the filters."
        }
        action={
          filters.page > 1
            ? { label: "Back to first page", onClick: () => update({}) }
            : activeCount > 0 || filters.search
              ? { label: "Clear filters", onClick: clearAll }
              : undefined
        }
      />
    );
  } else {
    content = (
      <div className="flex flex-col gap-8">
        {groups.map((g) => (
          <MovieSessions key={g.movie.id} group={g} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-app px-[51px] pb-16">
      <header className="mb-6">
        <h1 className="text-h1">Sessions</h1>
        <p className="text-body-s text-muted">Browse showtimes across all venues</p>
      </header>

      <div className="flex items-start gap-[51px]">
        <FiltersPanel
          filters={filters}
          update={update}
          clearAll={clearAll}
          activeCount={activeCount}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex min-h-[18px] items-center justify-between">
            <p className="text-label-m" aria-live="polite">
              {countText}
            </p>
            {options.data && (
              <SortDropdown
                value={filters.sort}
                options={options.data.sorts}
                onChange={(sort) => update({ sort })}
              />
            )}
          </div>

          {filters.search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              className="text-label-s flex w-fit cursor-pointer items-center gap-2 rounded-full bg-surface px-3 py-1.5 hover:bg-surface-2"
            >
              Search: “{filters.search}” <span aria-hidden>✕</span>
              <span className="sr-only">clear search</span>
            </button>
          )}

          {content}

          {meta && meta.lastPage > 1 && groups.length > 0 && (
            <Pagination page={meta.currentPage} lastPage={meta.lastPage} onChange={goToPage} />
          )}
        </div>
      </div>
    </div>
  );
}
