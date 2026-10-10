import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/api/endpoints/movies";
import { useDebounce } from "@/hooks/useDebounce";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

const panel =
  "absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-surface-2 bg-bg shadow-modal";

function Message({ title, text, onBrowse }: { title: string; text: string; onBrowse: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
      <p className="text-label-m">{title}</p>
      <p className="text-body-s text-muted">{text}</p>
      <button
        type="button"
        onClick={onBrowse}
        className="text-btn mt-2 cursor-pointer rounded-full bg-surface px-5 py-2 hover:bg-surface-2"
      >
        Browse all sessions
      </button>
    </div>
  );
}

export function SearchBox() {
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const term = useDebounce(value.trim(), 300);

  const query = useQuery({
    queryKey: ["search", term],
    queryFn: () => searchMovies(term),
    enabled: term.length > 0,
  });

  useEffect(() => {
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const browse = () => {
    setOpen(false);
    navigate("/sessions");
  };

  const typing = value.trim() !== term; // waiting for the debounce
  const results = query.data ?? [];

  let body;
  if (!value.trim()) {
    body = (
      <Message
        title="What do you want to watch?"
        text="Search by title, director or cast"
        onBrowse={browse}
      />
    );
  } else if (typing || query.isLoading) {
    body = (
      <div className="flex flex-col gap-3 p-4" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  } else if (query.isError) {
    body = (
      <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
        <p role="alert" className="text-body-s text-danger">
          Search failed. Please try again.
        </p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="text-btn cursor-pointer rounded-full bg-surface px-5 py-2 hover:bg-surface-2"
        >
          Retry
        </button>
      </div>
    );
  } else if (results.length === 0) {
    body = (
      <Message
        title={`No results for “${term}”`}
        text="Check the spelling or try another film or live event."
        onBrowse={browse}
      />
    );
  } else {
    body = (
      <>
        <div className="text-overline flex items-center justify-between px-4 pt-3 text-[11px] text-muted">
          <span>Films &amp; events</span>
          <span className="normal-case tracking-normal">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
        <ul className="p-2">
          {results.map((m) => (
            <li key={m.id}>
              <Link
                to={`/movies/${m.slug}`}
                onClick={() => {
                  setOpen(false);
                  setValue("");
                }}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface"
              >
                <img src={m.posterUrl} alt="" className="h-12 w-9 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-label-m truncate">{m.title}</p>
                  <p className="text-body-s text-muted">
                    Film · {m.ageRating.code} · {m.runtimeMinutes} min
                  </p>
                </div>
                <span className={cn("text-label-m", m.isComingSoon && "text-warning")}>
                  {m.isComingSoon ? "Coming Soon" : `from ${formatPrice(m.fromPrice)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div ref={ref} className="relative w-[320px]">
      <div className="flex h-9 items-center gap-2 rounded-full bg-white/10 px-4 backdrop-blur">
        <span aria-hidden className="text-muted">
          ⌕
        </span>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search films and live events"
          aria-label="Search films and live events"
          className="text-body-s h-full min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-muted"
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setValue("")}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/20 text-[10px]"
          >
            ✕
          </button>
        )}
      </div>
      {open && <div className={panel}>{body}</div>}
    </div>
  );
}
