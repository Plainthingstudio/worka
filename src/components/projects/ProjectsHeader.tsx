
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectsHeaderProps {
  onCreateProject: () => void;
}

const ProjectsHeader = ({ onCreateProject }: ProjectsHeaderProps) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">
          Projects
        </h1>
        <p className="text-muted-foreground">
          Track and manage all your client projects.
        </p>
      </div>
      <Button onClick={onCreateProject} className="w-full whitespace-nowrap sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Create Project
      </Button>
    </div>
  );
};

export default ProjectsHeader;
