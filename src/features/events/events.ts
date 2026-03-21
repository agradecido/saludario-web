// Base interface shared by all event types.
// Properties are ordered alphabetically per project conventions.
export interface BaseEvent {
    created_at: string;
    id: string;
    type: "food" | "symptom";
    updated_at: string;
    user_id: string;
}

// Food diary entry event. Maps to the /api/v1/entries endpoints.
export interface FoodEvent extends BaseEvent {
    consumed_at: string;
    food_name: string;
    ingredients: string[];
    meal_category_code: string;
    notes: string | null;
    quantity_unit: string | null;
    quantity_value: number | null;
    type: "food";
}

// Symptom tracking event. Maps to the /api/v1/internal/symptoms/events endpoints.
export interface SymptomEvent extends BaseEvent {
    notes: string | null;
    occurred_at: string;
    severity: number;
    symptom_code: string;
    type: "symptom";
}

// Discriminated union of all event types.
export type AppEvent = FoodEvent | SymptomEvent;

// Paginated response shape for a mixed event collection.
export interface AppEventsPage {
    data: AppEvent[];
    page: {
        has_more: boolean;
        limit: number;
        next_cursor: string | null;
    };
}

// Returns the canonical event timestamp regardless of event type.
export function getEventTimestamp(event: AppEvent): string {
    return event.type === "food" ? event.consumed_at : event.occurred_at;
}
