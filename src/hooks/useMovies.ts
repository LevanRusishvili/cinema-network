import { useQuery } from "@tanstack/react-query";
import { getComingSoon, getFeatured, getNowPlaying } from "@/api/endpoints/movies";

export const useFeatured = () =>
  useQuery({ queryKey: ["movies", "featured"], queryFn: getFeatured });

export const useNowPlaying = (limit?: number) =>
  useQuery({ queryKey: ["movies", "now-playing", limit], queryFn: () => getNowPlaying(limit) });

export const useComingSoon = (limit?: number) =>
  useQuery({ queryKey: ["movies", "coming-soon", limit], queryFn: () => getComingSoon(limit) });
