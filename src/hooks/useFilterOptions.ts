import { useQuery } from "@tanstack/react-query";
import { getFilterOptions } from "@/api/endpoints/filters";

export const useFilterOptions = () =>
  useQuery({ queryKey: ["filter-options"], queryFn: getFilterOptions, staleTime: Infinity });
