
import { ProjectStatus, ProjectType } from "@/types";

export const getStatusBadgeClass = (status: ProjectStatus) => {
  switch (status) {
    case "Planning":
      return "bg-blue-50 text-blue-700 ring-blue-700/10";
    case "In progress":
      return "bg-yellow-50 text-yellow-800 ring-yellow-600/20";
    case "Completed":
      return "bg-green-50 text-green-700 ring-green-600/20";
    case "Paused":
      return "bg-purple-50 text-purple-700 ring-purple-700/10";
    case "Cancelled":
      return "bg-red-50 text-red-700 ring-red-600/10";
    default:
      return "bg-gray-50 text-gray-600 ring-gray-500/10";
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
