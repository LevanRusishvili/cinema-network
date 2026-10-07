import { api } from "../client";
import type { Order, SeatHold } from "@/types";

export type HoldSeat = { seatId: number; ticketType: string };

export const createHold = (sessionId: number, seats: HoldSeat[]) =>
  api.post<{ data: SeatHold }>(`/sessions/${sessionId}/holds`, { seats }).then((r) => r.data.data);

export const getHold = (id: string) =>
  api.get<{ data: SeatHold }>(`/holds/${id}`).then((r) => r.data.data);

export const releaseHold = (id: string) => api.delete(`/holds/${id}`);

export type OrderBody = {
  holdId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

export const createOrder = (body: OrderBody) =>
  api.post<{ data: Order }>("/orders", body).then((r) => r.data.data);
