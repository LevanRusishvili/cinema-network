import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Option = { id: string; label: string };
type Props = { value: string; options: Option[]; onChange: (id: string) => void };

export function SortDropdown({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const current = options.find((o) => o.id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="text-body-s flex cursor-pointer items-center gap-2"
      >
        <span className="text-muted">Sort:</span>
        <span className="text-label-m">{current?.label ?? "Showtime: earliest first"}</span>
        <ChevronDownIcon className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-20 mt-2 w-60 rounded-xl border border-surface-2 bg-bg p-1 shadow-modal"
        >
          {options.map((o) => (
            <li key={o.id} role="option" aria-selected={o.id === value}>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onChange(o.id);
                }}
                className={cn(
                  "text-label-m w-full cursor-pointer rounded-lg px-3 py-2 text-left hover:bg-surface",
                  o.id === value && "text-primary",
                )}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
