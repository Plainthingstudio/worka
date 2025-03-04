
import React from "react";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Client, Project, ProjectStatus, ProjectType } from "@/types";

interface ProjectInfoProps {
  project: Project;
  client: Client;
}

const ProjectInfo = ({ project, client }: ProjectInfoProps) => {
  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case "Planning":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "In progress":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80";
      case "Completed":
        return "bg-green-100 text-green-800 hover:bg-green-100/80";
      case "Paused":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  const getProjectTypeBadgeClass = (type: ProjectType) => {
    switch (type) {
      case "Project Based":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100/80";
      case "Monthly Retainer":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100/80";
      case "Monthly Pay as you go":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100/80";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100/80";
    }
  };

  return (
    <div className="glass-card col-span-7 md:col-span-5 rounded-xl border shadow-sm">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge className={getStatusBadgeClass(project.status)}>
              {project.status}
            </Badge>
            <Badge className={`flex items-center gap-1 ${getProjectTypeBadgeClass(project.projectType)}`}>
              <Tag className="h-3 w-3" />
              <span>{project.projectType}</span>
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold">Client Information</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Name:</span>{" "}
                  {client.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Email:</span>{" "}
                  {client.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Phone:</span>{" "}
                  {client.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Lead Source:
                  </span>{" "}
                  {client.leadSource}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Project Details</h3>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Deadline:
                  </span>{" "}
                  {format(new Date(project.deadline), "MMMM dd, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Fee:</span>{" "}
                  {project.fee.toLocaleString()} {project.currency}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Created At:
                  </span>{" "}
                  {format(new Date(project.createdAt), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
