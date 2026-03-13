import { z } from "zod";

import { getLocalTimeZone } from "../../lib/datetime";

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required.")
});

export const registerFormSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required.")
    .default(getLocalTimeZone())
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

