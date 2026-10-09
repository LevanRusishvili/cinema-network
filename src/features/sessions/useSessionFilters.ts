import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { isValid, parseISO } from "date-fns";
import { today } from "@/lib/date";

export type SessionFilters = {
  venues: string[];
  formats: string[];
  languages: string[];
  bands: string[];
  date: string;
  sort: string;
  search: string;
  page: number;
};

const DEFAULT_SORT = "time_asc";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const toList = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

export function useSessionFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<SessionFilters>(() => {
    const date = params.get("date");
    const page = Number(params.get("page"));
    return {
      venues: toList(params.get("venue")),
      formats: toList(params.get("format")),
      languages: toList(params.get("language")),
      bands: toList(params.get("time")),
      date: date && DATE_RE.test(date) && isValid(parseISO(date)) ? date : today(),
      sort: params.get("sort") ?? DEFAULT_SORT,
      search: params.get("search") ?? "",
      page: Number.isInteger(page) && page > 0 ? page : 1,
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<SessionFilters>) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        const write = (key: string, value: string) =>
          value ? next.set(key, value) : next.delete(key);

        if (patch.venues) write("venue", patch.venues.join(","));
        if (patch.formats) write("format", patch.formats.join(","));
        if (patch.languages) write("language", patch.languages.join(","));
        if (patch.bands) write("time", patch.bands.join(","));
        if (patch.date !== undefined) write("date", patch.date);
        if (patch.search !== undefined) write("search", patch.search);
        if (patch.sort !== undefined) write("sort", patch.sort === DEFAULT_SORT ? "" : patch.sort);

        // any change resets to page 1, unless the change is the page itself
        if (patch.page && patch.page > 1) next.set("page", String(patch.page));
        else next.delete("page");
        return next;
      });
    },
    [setParams],
  );

  // clears every selection except the date (and the sort, which is not a filter)
  const clearAll = useCallback(
    () => update({ venues: [], formats: [], languages: [], bands: [], search: "" }),
    [update],
  );

  const activeCount =
    filters.venues.length +
    filters.formats.length +
    filters.languages.length +
    filters.bands.length;

  return { filters, update, clearAll, activeCount };
}
