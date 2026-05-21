
import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, Project, TeamMember } from "@/types";
import { DeadlineSort } from "@/hooks/useProjectFilters";
import ProjectItem from "./ProjectItem";

const headStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: 14,
  lineHeight: "20px",
};

const headClass = "bg-surface-2 text-muted-foreground";

interface ProjectsTableProps {
  projects: Project[];
  clients: Client[];
  allTeamMembers: TeamMember[];
  deadlineSort: DeadlineSort;
  onToggleDeadlineSort: () => void;
  onDelete: (id: string) => void;
  onInlineUpdate: (projectId: string, fields: Partial<Project>) => void;
}

const ProjectsTable = ({
  projects,
  clients,
  allTeamMembers,
  deadlineSort,
  onToggleDeadlineSort,
  onDelete,
  onInlineUpdate,
}: ProjectsTableProps) => {
  const DeadlineIcon =
    deadlineSort === "asc" ? ArrowUp : deadlineSort === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <Table>
      <TableHeader>
        <TableRow className="rounded-none hover:bg-surface-2">
          <TableHead className={headClass} style={headStyle}>Project Name</TableHead>
          <TableHead className={headClass} style={headStyle}>Client</TableHead>
          <TableHead className={headClass} style={headStyle}>Status</TableHead>
          <TableHead className={headClass} style={headStyle}>
            <button
              type="button"
              onClick={onToggleDeadlineSort}
              className="inline-flex h-5 items-center gap-1 rounded-md px-1 text-left font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={
                deadlineSort === "asc"
                  ? "Sort deadline descending"
                  : deadlineSort === "desc"
                    ? "Clear deadline sort"
                    : "Sort deadline ascending"
              }
            >
              <span>Deadline</span>
              <DeadlineIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </TableHead>
          <TableHead className={headClass} style={headStyle}>Fee</TableHead>
          <TableHead className={headClass} style={headStyle}>Type</TableHead>
          <TableHead className={headClass} style={headStyle}>Team</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="h-24 text-center text-muted-foreground"
            >
              No projects found.
            </TableCell>
          </TableRow>
        ) : (
          projects.map((project) => {
            const client = clients.find(c => c.id === project.clientId);
            return (
              <ProjectItem
                key={project.id}
                project={project}
                client={client}
                allClients={clients}
                allTeamMembers={allTeamMembers}
                onDelete={onDelete}
                onInlineUpdate={onInlineUpdate}
              />
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable;
