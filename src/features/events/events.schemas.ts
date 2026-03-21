import { z } from "zod";

import { foodEventFormSchema } from "../entries/entries.schemas";
import { symptomEventFormSchema } from "../symptoms/symptoms.schemas";

// Combined discriminated union schema covering all event form types.
export const appEventFormSchema = z.discriminatedUnion("type", [
    foodEventFormSchema,
    symptomEventFormSchema
]);

export type AppEventFormValues = z.infer<typeof appEventFormSchema>;

// Re-export sub-schemas and their types for convenience.
export { foodEventFormSchema, symptomEventFormSchema };
export type { FoodEventFormValues } from "../entries/entries.schemas";
export type { SymptomEventFormValues } from "../symptoms/symptoms.schemas";
