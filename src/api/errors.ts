import { AxiosError } from "axios";

type Body = { message?: string; errors?: Record<string, string[]>; contested?: string[] };

export function parseApiError(err: unknown) {
  const e = err as AxiosError<Body>;
  return {
    status: e.response?.status ?? 0,
    message: e.response?.data?.message ?? "Something went wrong. Please try again.",
    fieldErrors: e.response?.data?.errors, // present = form problem
    contested: e.response?.data?.contested, // 409 seat codes
  };
}
