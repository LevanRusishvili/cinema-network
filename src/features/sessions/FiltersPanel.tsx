import { format, parseISO } from "date-fns";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useFilterOptions } from "@/hooks/useFilterOptions";
import { nextSevenDays } from "@/lib/date";
import { cn } from "@/lib/cn";
import type { SessionFilters } from "./useSessionFilters";

type Props = {
  filters: SessionFilters;
  update: (patch: Partial<SessionFilters>) => void;
  clearAll: () => void;
  activeCount: number;
};

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// "Morning (before 12:00)" -> { name: "Morning", hint: "before 12:00" }
const splitLabel = (label: string) => {
  const m = label.match(/^(.*?)\s*\((.*)\)$/);
  return m ? { name: m[1], hint: m[2] } : { name: label, hint: "" };
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h3 className="text-overline text-muted">{title}</h3>
    {children}
  </div>
);

const Divider = () => <div className="h-px bg-surface-2" />;

export function FiltersPanel({ filters, update, clearAll, activeCount }: Props) {
  const { data: options, isLoading, isError, refetch } = useFilterOptions();

const shell =
  "no-scrollbar sticky top-6 flex max-h-[calc(100vh-48px)] w-[320px] shrink-0 flex-col gap-6 overflow-y-auto rounded-[20px] bg-surface p-6";
  if (isLoading)
    return (
      <aside className={shell}>
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </aside>
    );
  if (isError || !options)
    return (
      <aside className={shell}>
        <ErrorState message="Could not load filters." onRetry={() => refetch()} />
      </aside>
    );

  // formats available in the selected venues; with no venue selected, all of them
  const allowed = filters.venues.length
    ? new Set(
        options.venues
          .filter((v) => filters.venues.includes(v.slug))
          .flatMap((v) => (v.formats ?? []).map((f) => f.slug)),
      )
    : null;
  const visibleFormats = allowed
    ? options.formats.filter((f) => allowed.has(f.slug))
    : options.formats;

  const onVenue = (slug: string) => {
    const venues = toggle(filters.venues, slug);
    const nowAllowed = venues.length
      ? new Set(
          options.venues
            .filter((v) => venues.includes(v.slug))
            .flatMap((v) => (v.formats ?? []).map((f) => f.slug)),
        )
      : null;
    // drop selected formats the chosen venues do not have
    update({
      venues,
      formats: nowAllowed ? filters.formats.filter((f) => nowAllowed.has(f)) : filters.formats,
    });
  };

  return (
    <aside className={shell}>
      <h2 className="text-h3">Filters</h2>

      <Section title="Venue">
        {options.venues.map((v) => (
          <Checkbox
            key={v.slug}
            label={v.name}
            hint={`· ${v.city}`}
            checked={filters.venues.includes(v.slug)}
            onChange={() => onVenue(v.slug)}
          />
        ))}
      </Section>
      <Divider />

      <Section title="Date">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {nextSevenDays().map((d) => {
            const active = d === filters.date;
            return (
              <button
                key={d}
                type="button"
                aria-pressed={active}
                onClick={() => update({ date: d })}
                className={cn(
                  "flex h-11 w-[38px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition",
                  active ? "bg-primary text-white" : "bg-surface-2 text-muted hover:text-white",
                )}
              >
                <span>{format(parseISO(d), "EEE")}</span>
                <span className="text-label-m">{format(parseISO(d), "d")}</span>
              </button>
            );
          })}
        </div>
      </Section>
      <Divider />

      <Section title="Format">
        {visibleFormats.map((f) => (
          <Checkbox
            key={f.slug}
            label={f.name}
            checked={filters.formats.includes(f.slug)}
            onChange={() => update({ formats: toggle(filters.formats, f.slug) })}
          />
        ))}
      </Section>
      <Divider />

      <Section title="Language">
        {options.languages.map((l) => (
          <Checkbox
            key={l.slug}
            label={l.name}
            checked={filters.languages.includes(l.slug)}
            onChange={() => update({ languages: toggle(filters.languages, l.slug) })}
          />
        ))}
      </Section>
      <Divider />

      <Section title="Time of day">
        {options.timeBands.map((b) => {
          const { name, hint } = splitLabel(b.label);
          return (
            <Checkbox
              key={b.id}
              label={name}
              hint={hint}
              checked={filters.bands.includes(b.id)}
              onChange={() => update({ bands: toggle(filters.bands, b.id) })}
            />
          );
        })}
      </Section>
      <Divider />

      <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col items-center gap-3 rounded-b-[20px] bg-surface px-6 pb-6 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={activeCount === 0}
          onClick={clearAll}
        >
          Clear all filters
        </Button>
        <p className="text-body-s text-muted">{activeCount} filters active</p>
      </div>
    </aside>
  );
}
