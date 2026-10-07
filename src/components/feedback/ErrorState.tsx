import { Button } from "@/components/ui/Button";

type Props = { message?: string; onRetry?: () => void };

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: Props) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-danger">{message}</p>
      {onRetry && (
        <Button variant="dark" onClick={onRetry}>
          {" "}
          Retry
        </Button>
      )}
    </div>
  );
}
