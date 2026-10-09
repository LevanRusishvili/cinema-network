import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "light" | "dark" | "outline" | "ghost";
export type ButtonSize = "md" | "hero" | "sm";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:brightness-110 disabled:bg-subtle disabled:text-white/60",
  light: "bg-white text-bg hover:bg-white/90 disabled:bg-white/40",
  dark: "bg-surface-2 text-white hover:bg-surface-2/80 disabled:text-white/40",
  outline: "border border-white/30 text-white hover:bg-white/10",
  ghost: "text-muted hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-6",
  hero: "h-9 px-5",
  sm: "h-8 px-4",
};

export const buttonClasses = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) =>
  cn(
    "text-btn inline-flex items-center justify-center gap-2 rounded-full transition",
    "cursor-pointer disabled:cursor-not-allowed",
    variants[variant],
    sizes[size],
    className,
  );
