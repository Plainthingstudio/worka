
import React from "react";
import { ProjectStatus } from "@/types";
import { getStatusBadgeClass } from "../utils/projectItemUtils";

interface StatusCellProps {
  status: ProjectStatus;
}

const StatusCell = ({ status }: StatusCellProps) => {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadgeClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusCell;
