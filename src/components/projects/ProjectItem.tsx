
import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, Tag, Pencil, Trash, EyeIcon } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Client, Project, ProjectStatus, ProjectType } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectItemProps {
  project: Project;
  client: Client | undefined;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectItem = ({ project, client, onEdit, onDelete }: ProjectItemProps) => {
  const navigate = useNavigate();

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case "Planning":
        return "status-badge status-planning";
      case "In progress":
        return "status-badge status-in-progress";
      case "Completed":
        return "status-badge status-completed";
      case "Paused":
        return "status-badge status-paused";
      case "Cancelled":
        return "status-badge status-cancelled";
      default:
        return "status-badge";
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
    <TableRow key={project.id}>
      <TableCell className="font-medium">
        {project.name}
      </TableCell>
      <TableCell>
        {client?.name || "Unknown Client"}
      </TableCell>
      <TableCell>
        <span className={getStatusBadgeClass(project.status)}>
          {project.status}
        </span>
      </TableCell>
      <TableCell className="flex items-center gap-1 text-muted-foreground">
        <CalendarIcon className="h-3.5 w-3.5" />
        {format(new Date(project.deadline), "MMM dd, yyyy")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          {project.fee.toLocaleString()} {project.currency}
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          variant={getProjectTypeBadgeVariant(project.projectType)}
          className="flex items-center gap-1"
        >
          <Tag className="h-3.5 w-3.5" />
          {project.projectType}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <EyeIcon className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(project)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProjectItem;
