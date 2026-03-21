import { z } from "zod";

const optionalTrimmed = (maxLength: number) =>
  z.string().trim().max(maxLength).optional().or(z.literal(""));

// Canonical schema for food event forms. Includes the type discriminator.
export const foodEventFormSchema = z.object({
  type: z.literal("food"),
  consumed_at: z.string().min(1, "Consumption time is required."),
  food_name: z.string().trim().min(1, "Food name is required.").max(500),
  meal_category_code: z.string().trim().min(1, "Meal category is required."),
  notes: optionalTrimmed(2000),
  quantity_unit: optionalTrimmed(50),
  quantity_value: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || Number(value) > 0, "Quantity must be a positive number.")
});

// Backward-compatible alias.
export const entryFormSchema = foodEventFormSchema;

export type FoodEventFormValues = z.infer<typeof foodEventFormSchema>;
export type EntryFormValues = FoodEventFormValues;

