import { apiRequest } from "../../lib/api";

export interface SymptomEvent {
    created_at: string;
    id: string;
    notes: string | null;
    occurred_at: string;
    severity: number;
    symptom_code: string;
    updated_at: string;
    user_id: string;
}

export interface SymptomsResponse {
    data: SymptomEvent[];
    page: {
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
    };
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
    return apiRequest<SymptomsResponse>(
        `/api/v1/internal/symptoms/events${buildQueryString(filters)}`
    );
}

export async function getSymptomEvent(symptomEventId: string): Promise<SymptomEvent> {
    return apiRequest<SymptomEvent>(`/api/v1/internal/symptoms/events/${symptomEventId}`);
}

export async function createSymptomEvent(payload: SymptomEventPayload): Promise<SymptomEvent> {
    return apiRequest<SymptomEvent>("/api/v1/internal/symptoms/events", {
        method: "POST",
        body: payload
    });
}
