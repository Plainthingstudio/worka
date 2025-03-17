
import React from "react";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectType } from "@/types";
import { getProjectTypeBadgeVariant } from "../utils/projectItemUtils";

interface ProjectTypeCellProps {
  type: ProjectType;
}

const ProjectTypeCell = ({ type }: ProjectTypeCellProps) => {
  return (
    <Badge 
      variant={getProjectTypeBadgeVariant(type)}
      className="inline-flex items-center gap-1"
    >
      <Tag className="h-3.5 w-3.5" />
      {type}
    </Badge>
  );
};

export default ProjectTypeCell;
