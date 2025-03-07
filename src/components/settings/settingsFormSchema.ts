
import * as z from "zod";

// Define form schema
export const settingsFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address.").optional(),
  phoneNumber: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const defaultValues: SettingsFormValues = {
  fullName: "",
  email: "demo@example.com", // Read-only
  phoneNumber: "",
  streetAddress: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};
