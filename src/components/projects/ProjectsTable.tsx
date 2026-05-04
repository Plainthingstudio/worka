
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, Project, TeamMember } from "@/types";
import ProjectItem from "./ProjectItem";

interface ProjectsTableProps {
  projects: Project[];
  clients: Client[];
  allTeamMembers: TeamMember[];
  onDelete: (id: string) => void;
  onInlineUpdate: (projectId: string, fields: Partial<Project>) => void;
}

const ProjectsTable = ({ projects, clients, allTeamMembers, onDelete, onInlineUpdate }: ProjectsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Name</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Team</TableHead>
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
