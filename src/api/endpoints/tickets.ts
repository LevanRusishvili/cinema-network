import { api } from "../client";
import type { Order } from "@/types";

export const getTickets = (filter?: "upcoming" | "past") =>
  api.get<{ data: Order[] }>("/tickets", { params: { filter } }).then((r) => r.data.data);

export const refundOrder = (reference: string) =>
  api.post<{ data: Order }>(`/orders/${reference}/refund`).then((r) => r.data.data);
