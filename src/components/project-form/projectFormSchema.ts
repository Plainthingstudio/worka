
import { z } from "zod";
import { ProjectStatus, ProjectType, Currency } from "@/types";

export const projectFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  clientId: z.string({
    required_error: "Please select a client."
  }),
  status: z.enum(["Planning", "In progress", "Completed", "Paused", "Cancelled"], {
    required_error: "Please select a status."
  }),
  deadline: z.date({
    required_error: "Please select a deadline date."
  }),
  fee: z.coerce.number().min(0, {
    message: "Fee cannot be negative."
  }),
  currency: z.enum(["USD", "IDR"], {
    required_error: "Please select a currency."
  }),
  projectType: z.enum(["Project Based", "Monthly Retainer", "Monthly Pay as you go"], {
    required_error: "Please select a project type."
  }),
  serviceIds: z.array(z.string()).optional(),
  subServiceIds: z.array(z.string()).optional(),
  serviceQuantities: z.array(z.number().int().min(0)).optional(),
  subServiceQuantities: z.array(z.number().int().min(0)).optional(),
  teamMembers: z.array(z.string()).optional()
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const projectStatuses: ProjectStatus[] = ["Planning", "In progress", "Completed", "Paused", "Cancelled"];
export const currencies: Currency[] = ["USD", "IDR"];
export const projectTypes: ProjectType[] = ["Project Based", "Monthly Retainer", "Monthly Pay as you go"];
