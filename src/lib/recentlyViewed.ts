import { metaLine } from "@/lib/format";
import type { AgeRating, Movie } from "@/types";

export type RecentMovie = {
  id: number;
  slug: string;
  title: string;
  posterUrl: string;
  meta: string;
  ageRating: AgeRating;
};

const KEY = "recently-viewed";
const MAX = 10;

export function readRecentlyViewed(): RecentMovie[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// call this when the movie details page opens
export function addRecentlyViewed(movie: Movie) {
  const entry: RecentMovie = {
    id: movie.id,
    slug: movie.slug,
    title: movie.title,
    posterUrl: movie.posterUrl,
    meta: metaLine(movie),
    ageRating: movie.ageRating,
  };
  const list = [entry, ...readRecentlyViewed().filter((m) => m.id !== movie.id)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage is full or blocked, ignore
  }
}
