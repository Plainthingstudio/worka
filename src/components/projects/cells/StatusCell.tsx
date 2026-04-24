
import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectStatus } from "@/types";
import { getStatusBadgeVariant } from "../utils/projectItemUtils";

const STATUS_OPTIONS: ProjectStatus[] = [
  "Planning",
  "In progress",
  "Awaiting Feedback",
  "Completed",
  "Paused",
  "Cancelled",
];

interface StatusCellProps {
  status: ProjectStatus;
  onSave?: (status: ProjectStatus) => void;
}

const StatusCell = ({ status, onSave }: StatusCellProps) => {
  if (!onSave) {
    return <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded focus:outline-none focus:ring-1 focus:ring-[#3762FB]"
          onClick={e => e.stopPropagation()}
        >
          <Badge
            variant={getStatusBadgeVariant(status)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {status}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={e => e.stopPropagation()} className="w-44">
        {STATUS_OPTIONS.map(s => (
          <DropdownMenuItem
            key={s}
            className={s === status ? "font-medium text-[#3762FB]" : ""}
            onClick={() => onSave(s)}
          >
            <Badge variant={getStatusBadgeVariant(s)} className="pointer-events-none">
              {s}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusCell;
