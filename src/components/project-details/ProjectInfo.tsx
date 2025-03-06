
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

  const getProjectTypeBadgeVariant = (type: ProjectType) => {
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

  return (
    <div className="glass-card col-span-7 md:col-span-5 rounded-xl border shadow-sm">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge className={getStatusBadgeClass(project.status)}>
              {project.status}
            </Badge>
            <Badge 
              variant={getProjectTypeBadgeVariant(project.projectType)}
              className="flex items-center gap-1 w-fit"
            >
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
                
                {project.categories && project.categories.length > 0 && (
                  <div>
                    <p className="text-sm mb-1 font-medium text-foreground">Categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.categories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
