import { z } from "zod";

export const symptomFormSchema = z.object({
    symptom_code: z.string().trim().min(1, "Describe the symptom.").max(200),
    severity: z.number().int().min(1, "Select a severity level.").max(5),
    occurred_at: z.string().min(1, "Time is required."),
    notes: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .or(z.literal(""))
});

export type SymptomFormValues = z.infer<typeof symptomFormSchema>;
