
import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash, CheckCircle, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";

interface ProjectHeaderProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsCompleted: () => void;
  onChangeStatus: () => void;
}

const ProjectHeader = ({ 
  project, 
  onEdit, 
  onDelete, 
  onMarkAsCompleted, 
  onChangeStatus 
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
          variant="outline"
          className="gap-2"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" /> Edit
        </Button>
        <Button
          variant="destructive"
          className="gap-2"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" /> Delete
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
      </div>
    </div>
  );
};

export default ProjectHeader;
