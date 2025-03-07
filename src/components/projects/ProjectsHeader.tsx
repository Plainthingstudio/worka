
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectsHeaderProps {
  onCreateProject: () => void;
}

const ProjectsHeader = ({ onCreateProject }: ProjectsHeaderProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Projects
        </h1>
        <p className="text-muted-foreground">
          Track and manage all your client projects.
        </p>
      </div>
      <Button onClick={onCreateProject} className="whitespace-nowrap">
        <Plus className="mr-2 h-4 w-4" />
        Create Project
      </Button>
    </div>
  );
};

export default ProjectsHeader;
