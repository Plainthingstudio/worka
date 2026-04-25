
import React from "react";
import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectType } from "@/types";
import { getProjectTypeBadgeVariant } from "../utils/projectItemUtils";

const TYPE_OPTIONS: ProjectType[] = [
  "Project Based",
  "Monthly Retainer",
  "Monthly Pay as you go",
];

interface ProjectTypeCellProps {
  type: ProjectType;
  onSave?: (type: ProjectType) => void;
}

const ProjectTypeCell = ({ type, onSave }: ProjectTypeCellProps) => {
  if (!onSave) {
    return (
      <Badge variant={getProjectTypeBadgeVariant(type)} className="inline-flex items-center gap-1">
        <Tag className="h-3.5 w-3.5" />
        {type}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded focus:outline-none focus:ring-1 focus:ring-primary"
          onClick={e => e.stopPropagation()}
        >
          <Badge
            variant={getProjectTypeBadgeVariant(type)}
            className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Tag className="h-3.5 w-3.5" />
            {type}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={e => e.stopPropagation()} className="w-52">
        {TYPE_OPTIONS.map(t => (
          <DropdownMenuItem
            key={t}
            className={t === type ? "font-medium text-primary" : ""}
            onClick={() => onSave(t)}
          >
            <Badge variant={getProjectTypeBadgeVariant(t)} className="inline-flex items-center gap-1 pointer-events-none">
              <Tag className="h-3.5 w-3.5" />
              {t}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectTypeCell;
