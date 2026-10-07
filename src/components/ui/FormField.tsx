import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Props = ComponentProps<"input"> & {
  label: string;
  error?: string;
  valid?: boolean;
};

export function FormField({ label, error, valid, className, ...rest }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={cn("text-label-m", error ? "text-danger" : "text-white")}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={!!error}
          className={cn(
            "text-body-m h-11 w-full rounded-xl border bg-surface px-4 pr-10 text-white outline-none transition-colors",
            "placeholder:text-muted/70 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-muted",
            error ? "border-danger text-danger" : "border-transparent focus:border-white/30",
            className,
          )}
          {...rest}
        />
        {error && (
          <span aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 text-danger">
            ⓘ
          </span>
        )}
        {valid && !error && (
          <span aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
            ✓
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="text-body-s text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
