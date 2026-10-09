import type { ComponentProps } from "react";
import { Spinner } from "@/components/feedback/Spinner";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./buttonClasses";

type Props = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({ variant, size, loading, disabled, className, children, ...rest }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
