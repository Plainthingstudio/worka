
import { ProjectStatus, ProjectType } from "@/types";

export const getStatusBadgeVariant = (status: ProjectStatus) => {
  switch (status) {
    case "Planning":
      return "planning";
    case "In progress":
      return "in-progress";
    case "Completed":
      return "completed";
    case "Paused":
      return "paused";
    case "Cancelled":
      return "cancelled";
    default:
      return "secondary";
  }
};

export const getProjectTypeBadgeVariant = (type: ProjectType) => {
  switch (type) {
    case "Project Based":
      return "project-based";
    case "Monthly Retainer":
      return "monthly-retainer";
    case "Monthly Pay as you go":
      return "monthly-pay";
    default:
      return "secondary";
  }
};

export const getBriefStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "New":
      return "new";
    case "In Progress":
      return "in-progress";
    case "Completed":
      return "completed";
    case "Cancelled":
      return "cancelled";
    default:
      return "secondary";
  }
};

export const getLeadSourceBadgeVariant = (source: string) => {
  switch (source) {
    case "Dribbble":
      return "dribbble";
    case "Website":
      return "website";
    case "LinkedIn":
      return "linkedin";
    case "Behance":
      return "behance";
    case "Direct Email":
      return "direct-email";
    case "Other":
      return "other";
    default:
      return "other";
  }
};
