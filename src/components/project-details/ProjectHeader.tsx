
import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash, CheckCircle, X, RotateCcw, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/types";

interface ProjectHeaderProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsCompleted: () => void;
  onChangeStatus: () => void;
  onCreateTask: () => void;
}

const ProjectHeader = ({ 
  project, 
  onEdit, 
  onDelete, 
  onMarkAsCompleted, 
  onChangeStatus,
  onCreateTask
}: ProjectHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => navigate("/projects")}
          className="gap-2"
        >
          <X className="h-4 w-4" /> Back to Projects
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          className="gap-2"
          onClick={onCreateTask}
        >
          <Plus className="h-4 w-4" /> Create Task
        </Button>

        {project.status !== "Completed" ? (
          <Button
            variant="outline"
            className="gap-2"
            onClick={onMarkAsCompleted}
          >
            <CheckCircle className="h-4 w-4" /> Mark as Completed
          </Button>
        ) : (
          <Button
            variant="outline"
            className="gap-2"
            onClick={onChangeStatus}
          >
            <RotateCcw className="h-4 w-4" /> Change Status
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectHeader;
