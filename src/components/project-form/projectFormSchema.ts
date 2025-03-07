
import { z } from "zod";
import { ProjectStatus, ProjectType, Currency, ProjectCategory } from "@/types";

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
  categories: z.array(z.string()).min(1, {
    message: "Select at least one category."
  }),
  teamMembers: z.array(z.string()).optional()
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const categoryOptions: ProjectCategory[] = [
  'Landing Page',
  'Website Design',
  'Mobile App Design',
  'Dashboard Design',
  'Framer Development',
  'Webflow Development',
  '2D Illustrations',
  '3D Illustrations',
  '2D Animations',
  '3D Animations',
  'Logo Design',
  'Branding Design'
];

export const projectStatuses: ProjectStatus[] = ["Planning", "In progress", "Completed", "Paused", "Cancelled"];
export const currencies: Currency[] = ["USD", "IDR"];
export const projectTypes: ProjectType[] = ["Project Based", "Monthly Retainer", "Monthly Pay as you go"];
