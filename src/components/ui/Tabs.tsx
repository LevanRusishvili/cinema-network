import { cn } from "@/lib/cn";

type Tab<T extends string> = { id: T; label: string; count?: number };

type Props<T extends string> = {
  tabs: Tab<T>[];
  value: T;
  onChange: (id: T) => void;
};

export function Tabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <div role="tablist" className="flex gap-8 border-b border-surface-2">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cn(
              "text-label-m -mb-px flex cursor-pointer items-center gap-2 border-b-2 pb-3 transition",
              active
                ? "border-primary text-white"
                : "border-transparent text-muted hover:text-white",
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] text-white">
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
