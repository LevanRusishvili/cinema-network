import { cn } from "@/lib/cn";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Props = { page: number; lastPage: number; onChange: (page: number) => void };

function pageList(current: number, last: number): (number | "gap")[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const nums = [...new Set([1, last, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= last)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

const arrow =
  "flex h-10 w-10 items-center justify-center rounded-full bg-surface transition enabled:cursor-pointer enabled:hover:bg-surface-2 disabled:opacity-40";

export function Pagination({ page, lastPage, onChange }: Props) {
  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={arrow}
        >
          <ChevronLeftIcon />
        </button>
        {pageList(page, lastPage).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="w-6 text-center text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onChange(p)}
              className={cn(
                "text-label-m h-10 w-10 cursor-pointer rounded-full transition",
                p === page ? "bg-primary text-white" : "text-white hover:bg-surface",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= lastPage}
          onClick={() => onChange(page + 1)}
          className={arrow}
        >
          <ChevronRightIcon />
        </button>
      </div>
      <p className="text-body-s text-muted">
        Page {page} of {lastPage}
      </p>
    </nav>
  );
}
