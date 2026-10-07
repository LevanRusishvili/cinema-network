import { api } from "../client";
import type { Movie, MovieDetail, VenueSessions } from "@/types";

const list = (path: string, limit?: number) =>
  api.get<{ data: Movie[] }>(path, { params: { limit } }).then((r) => r.data.data);

export const getNowPlaying = (limit?: number) => list("/movies/now-playing", limit);
export const getComingSoon = (limit?: number) => list("/movies/coming-soon", limit);
export const getFeatured = () => list("/movies/featured");

export const getMovie = (slug: string) =>
  api.get<{ data: MovieDetail }>(`/movies/${slug}`).then((r) => r.data.data);

export const getMovieSessions = (slug: string, date: string) =>
  api
    .get<{ data: VenueSessions[] }>(`/movies/${slug}/sessions`, { params: { date } })
    .then((r) => r.data.data);

export const notifyMe = (slug: string) => api.post(`/movies/${slug}/notify`);
