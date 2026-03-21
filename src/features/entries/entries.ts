import { apiRequest } from "../../lib/api";
import type { FoodEvent } from "../events/events";

// Re-export for backward compatibility with code that references Entry.
export type { FoodEvent as Entry };

export interface EntriesResponse {
  data: FoodEvent[];
  page: {
    has_more: boolean;
    limit: number;
    next_cursor: string | null;
  };
}

// Raw shape returned by the API before the type discriminator is added.
type RawFoodEvent = Omit<FoodEvent, "type">;

function toFoodEvent(raw: RawFoodEvent): FoodEvent {
  return { ...raw, type: "food" };
}

interface RawEntriesResponse {
  data: RawFoodEvent[];
  page: EntriesResponse["page"];
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
  const raw = await apiRequest<RawEntriesResponse>(`/api/v1/entries${buildQueryString(filters)}`);
  return { ...raw, data: raw.data.map(toFoodEvent) };
}

export async function getEntry(entryId: string): Promise<FoodEvent> {
  const raw = await apiRequest<RawFoodEvent>(`/api/v1/entries/${entryId}`);
  return toFoodEvent(raw);
}

export async function createEntry(payload: EntryPayload): Promise<FoodEvent> {
  const raw = await apiRequest<RawFoodEvent>("/api/v1/entries", {
    method: "POST",
    body: payload
  });
  return toFoodEvent(raw);
}

export async function updateEntry(entryId: string, payload: EntryUpdatePayload): Promise<FoodEvent> {
  const raw = await apiRequest<RawFoodEvent>(`/api/v1/entries/${entryId}`, {
    method: "PATCH",
    body: payload
  });
  return toFoodEvent(raw);
}

export async function deleteEntry(entryId: string): Promise<void> {
  return apiRequest<void>(`/api/v1/entries/${entryId}`, {
    method: "DELETE"
  });
}
