import { queryOptions } from "@tanstack/react-query";

import { apiRequest } from "../../lib/api";

export interface Category {
  code: "breakfast" | "lunch" | "dinner" | "snack";
  label: string;
  sort_order: number;
}

export interface CategoriesResponse {
  data: Category[];
}

export const fallbackCategories: Category[] = [
  { code: "breakfast", label: "Breakfast", sort_order: 1 },
  { code: "lunch", label: "Lunch", sort_order: 2 },
  { code: "dinner", label: "Dinner", sort_order: 3 },
  { code: "snack", label: "Snack", sort_order: 4 }
];

export function categoriesQueryOptions() {
  return queryOptions({
    queryKey: ["categories"],
    queryFn: () => apiRequest<CategoriesResponse>("/api/v1/categories"),
    staleTime: 5 * 60_000
  });
}

