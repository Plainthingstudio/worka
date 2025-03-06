
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Client, Project } from "@/types";
import ProjectItem from "./ProjectItem";

interface ProjectsTableProps {
  projects: Project[];
  clients: Client[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectsTable = ({ projects, clients, onEdit, onDelete }: ProjectsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project Name</TableHead>
          <TableHead>Categories</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={8}
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
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable;
