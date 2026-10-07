import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

import { Spinner } from "@/components/feedback/Spinner";

type Props = ComponentProps<"button"> & {
  variant?: "primary" | "light" | "dark" | "outline" | "ghost";
  size?: "md" | "sm";
  loading?: boolean;
};

const variants = {
  primary: "bg-primary text-white hover:brightness-110 disabled:bg-subtle disabled:text-white/60",
  light: "bg-white text-bg hover:bg-white/90 disabled:bg-white/40",
  dark: "bg-surface-2 text-white hover:bg-surface-2/80 disabled:text-white/40",
  outline: "border border-white/30 text-white hover:bg-white/10",
  ghost: "text-muted hover:text-white",
};

const sizes = { md: "h-11 px-6", sm: "h-8 px-4 text-xs" };

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "text-btn inline-flex items-center justify-center gap-2 rounded-full transition",
        "cursor-pointer disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
