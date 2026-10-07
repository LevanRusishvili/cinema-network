import { api } from "../client";
import type { FilterOptions } from "@/types";

export const getFilterOptions = () =>
  api.get<{ data: FilterOptions }>("/filter-options").then((r) => r.data.data);
