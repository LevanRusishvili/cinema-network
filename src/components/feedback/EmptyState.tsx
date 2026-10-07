import { Button } from "@/components/ui/Button";

type Props = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="max-w-md text-muted">{description}</p>}
      {action && (
        <Button variant="dark" onClick={action.onClick} className="mt-2">
          {" "}
          {action.label}
        </Button>
      )}
    </div>
  );
}
