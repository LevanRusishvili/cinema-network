import type { ReactNode } from "react";
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

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h3 className="text-overline text-[11px] text-muted/80">{title}</h3>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const Divider = () => <div className="h-px bg-white/5" />;

const shell = "flex w-[320px] shrink-0 flex-col gap-5 self-start rounded-2xl bg-surface p-6";

export function FiltersPanel({ filters, update, clearAll, activeCount }: Props) {
  const { data: options, isLoading, isError, refetch } = useFilterOptions();

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

  const formatsOf = (venueSlugs: string[]) =>
    venueSlugs.length
      ? new Set(
          options.venues
            .filter((v) => venueSlugs.includes(v.slug))
            .flatMap((v) => (v.formats ?? []).map((f) => f.slug)),
        )
      : null;

  // formats available in the selected venues; with no venue selected, all of them
  const allowed = formatsOf(filters.venues);
  const visibleFormats = allowed
    ? options.formats.filter((f) => allowed.has(f.slug))
    : options.formats;

  const onVenue = (slug: string) => {
    const venues = toggle(filters.venues, slug);
    const nowAllowed = formatsOf(venues);
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
                  "flex h-10 w-[34px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg text-[10px] font-semibold transition",
                  active ? "bg-primary text-white" : "bg-white/5 text-muted hover:text-white",
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

      <div className="flex flex-col items-center gap-3 pt-2">
        {activeCount > 0 && (
          <Button variant="outline" size="sm" className="w-full" onClick={clearAll}>
            Clear all filters
          </Button>
        )}
        <p className="text-body-s text-muted">{activeCount} filters active</p>
      </div>
    </aside>
  );
}
