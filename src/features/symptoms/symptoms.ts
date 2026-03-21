import { apiRequest } from "../../lib/api";
import type { SymptomEvent } from "../events/events";

// Re-export for convenience.
export type { SymptomEvent };

export interface SymptomsResponse {
    data: SymptomEvent[];
    page: {
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
    };
}

// Raw shape returned by the API before the type discriminator is added.
type RawSymptomEvent = Omit<SymptomEvent, "type">;

function toSymptomEvent(raw: RawSymptomEvent): SymptomEvent {
    return { ...raw, type: "symptom" };
}

interface RawSymptomsResponse {
    data: RawSymptomEvent[];
    page: SymptomsResponse["page"];
}

export interface SymptomEventPayload {
    notes?: string;
    occurred_at: string;
    severity: number;
    symptom_code: string;
}

export interface SymptomsFilters {
    from?: string;
    limit?: number;
    symptom_code?: string;
    to?: string;
}

function buildQueryString(filters: SymptomsFilters & { cursor?: string }): string {
    const searchParams = new URLSearchParams();

    if (filters.from) {
        searchParams.set("from", filters.from);
    }

    if (filters.to) {
        searchParams.set("to", filters.to);
    }

    if (filters.symptom_code) {
        searchParams.set("symptom_code", filters.symptom_code);
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

export async function listSymptomEvents(
    filters: SymptomsFilters & { cursor?: string } = {}
): Promise<SymptomsResponse> {
    const raw = await apiRequest<RawSymptomsResponse>(
        `/api/v1/internal/symptoms/events${buildQueryString(filters)}`
    );
    return { ...raw, data: raw.data.map(toSymptomEvent) };
}

export async function getSymptomEvent(symptomEventId: string): Promise<SymptomEvent> {
    const raw = await apiRequest<RawSymptomEvent>(`/api/v1/internal/symptoms/events/${symptomEventId}`);
    return toSymptomEvent(raw);
}

export async function createSymptomEvent(payload: SymptomEventPayload): Promise<SymptomEvent> {
    const raw = await apiRequest<RawSymptomEvent>("/api/v1/internal/symptoms/events", {
        method: "POST",
        body: payload
    });
    return toSymptomEvent(raw);
}
