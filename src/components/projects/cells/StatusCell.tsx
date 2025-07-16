
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/types";
import { getStatusBadgeVariant } from "../utils/projectItemUtils";

interface StatusCellProps {
  status: ProjectStatus;
}

const StatusCell = ({ status }: StatusCellProps) => {
  return (
    <Badge variant={getStatusBadgeVariant(status)}>
      {status}
    </Badge>
  );
};

export default StatusCell;
