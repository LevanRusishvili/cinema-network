import { cn } from "@/lib/cn";

type Props = { code: string; description?: string; className?: string };

export function AgeBadge({ code, description, className }: Props) {
  return (
    <span
      title={description}
      className={cn(
        "text-label-s inline-flex h-5 items-center rounded-full bg-primary/15 px-2 text-primary",
        className,
      )}
    >
      {code}
    </span>
  );
}
