import { api } from "../client";
import type { Session, SessionGroup, SessionsMeta, SeatMap } from "@/types";

export type SessionsParams = {
  date?: string;
  venues?: string[];
  formats?: string[];
  languages?: string[];
  bands?: string[];
  search?: string;
  sort?: string;
  page?: number;
};

// axios serializes arrays as venues[]=a&venues[]=b, which is what the API expects
export const getSessions = (params: SessionsParams) =>
  api
    .get<{ data: SessionGroup[]; meta: SessionsMeta }>("/sessions", { params })
    .then((r) => r.data);

export const getSession = (id: number) =>
  api.get<{ data: Session }>(`/sessions/${id}`).then((r) => r.data.data);

export const getSeatMap = (id: number) =>
  api.get<{ data: SeatMap }>(`/sessions/${id}/seats`).then((r) => r.data.data);
