
import React, { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client, Project, TeamMember } from "@/types";
import { useTeamMembers } from "@/hooks/useTeamMembers";

// Import all the cell components
import CategoryCell from "./cells/CategoryCell";
import StatusCell from "./cells/StatusCell";
import DateCell from "./cells/DateCell";
import FeeCell from "./cells/FeeCell";
import ProjectTypeCell from "./cells/ProjectTypeCell";
import TeamMembersCell from "./cells/TeamMembersCell";
import ActionsCell from "./cells/ActionsCell";

interface ProjectItemProps {
  project: Project;
  client: Client | undefined;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectItem = ({ project, client, onEdit, onDelete }: ProjectItemProps) => {
  const [assignedTeamMembers, setAssignedTeamMembers] = useState<TeamMember[]>([]);
  const { fetchTeamMembers } = useTeamMembers();
  
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (project.teamMembers && project.teamMembers.length > 0) {
        const allMembers = await fetchTeamMembers();
        const assigned = allMembers.filter(member => 
          project.teamMembers?.includes(member.id)
        );
        setAssignedTeamMembers(assigned);
      }
    };
    
    loadTeamMembers();
  }, [project.teamMembers]);

  return (
    <TableRow key={project.id}>
      <TableCell className="font-medium">
        {project.name}
      </TableCell>
      
      <TableCell>
        <CategoryCell categories={project.categories} />
      </TableCell>
      
      <TableCell>
        {client?.name || "Unknown Client"}
      </TableCell>
      
      <TableCell>
        <StatusCell status={project.status} />
      </TableCell>
      
      <TableCell>
        <DateCell date={project.deadline} />
      </TableCell>
      
      <TableCell>
        <FeeCell fee={project.fee} currency={project.currency} />
      </TableCell>
      
      <TableCell>
        <ProjectTypeCell type={project.projectType} />
      </TableCell>

      <TableCell>
        <TeamMembersCell teamMembers={assignedTeamMembers} />
      </TableCell>
      
      <TableCell className="text-right">
        <ActionsCell 
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProjectItem;
