import { apiRequest } from "../../lib/api";

export interface Entry {
  consumed_at: string;
  created_at: string;
  food_name: string;
  ingredients: string[];
  id: string;
  meal_category_code: string;
  notes: string | null;
  quantity_unit: string | null;
  quantity_value: number | null;
  updated_at: string;
  user_id: string;
}

export interface EntriesResponse {
  data: Entry[];
  page: {
    has_more: boolean;
    limit: number;
    next_cursor: string | null;
  };
}

export interface EntriesFilters {
  from?: string;
  limit?: number;
  meal_category_code?: string;
  to?: string;
}

export interface EntryPayload {
  consumed_at: string;
  food_name: string;
  ingredients?: string[];
  meal_category_code: string;
  notes?: string;
  quantity_unit?: string;
  quantity_value?: number;
}

export interface EntryUpdatePayload {
  consumed_at?: string;
  food_name?: string;
  ingredients?: string[];
  meal_category_code?: string;
  notes?: string;
  quantity_unit?: string;
  quantity_value?: number;
}

function buildQueryString(filters: EntriesFilters & { cursor?: string }): string {
  const searchParams = new URLSearchParams();

  if (filters.from) {
    searchParams.set("from", filters.from);
  }

  if (filters.to) {
    searchParams.set("to", filters.to);
  }

  if (filters.meal_category_code) {
    searchParams.set("meal_category_code", filters.meal_category_code);
  }

  if (filters.limit) {
    searchParams.set("limit", String(filters.limit));
  }

  if (filters.cursor) {
    searchParams.set("cursor", filters.cursor);
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export async function listEntries(
  filters: EntriesFilters & { cursor?: string } = {}
): Promise<EntriesResponse> {
  return apiRequest<EntriesResponse>(`/api/v1/entries${buildQueryString(filters)}`);
}

export async function getEntry(entryId: string): Promise<Entry> {
  return apiRequest<Entry>(`/api/v1/entries/${entryId}`);
}

export async function createEntry(payload: EntryPayload): Promise<Entry> {
  return apiRequest<Entry>("/api/v1/entries", {
    method: "POST",
    body: payload
  });
}

export async function updateEntry(entryId: string, payload: EntryUpdatePayload): Promise<Entry> {
  return apiRequest<Entry>(`/api/v1/entries/${entryId}`, {
    method: "PATCH",
    body: payload
  });
}

export async function deleteEntry(entryId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/entries/${entryId}`, {
    method: "DELETE"
  });
}
