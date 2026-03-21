import { z } from "zod";

// Canonical schema for symptom event forms. Includes the type discriminator.
export const symptomEventFormSchema = z.object({
    type: z.literal("symptom"),
    notes: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .or(z.literal("")),
    occurred_at: z.string().min(1, "Time is required."),
    severity: z.number().int().min(1, "Select a severity level.").max(5),
    symptom_code: z.string().trim().min(1, "Describe the symptom.").max(200)
});

// Backward-compatible alias.
export const symptomFormSchema = symptomEventFormSchema;

export type SymptomEventFormValues = z.infer<typeof symptomEventFormSchema>;
export type SymptomFormValues = SymptomEventFormValues;
