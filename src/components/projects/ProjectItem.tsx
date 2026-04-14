
import React, { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client, Project, TeamMember } from "@/types";
import { databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";

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
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (project.teamMembers && project.teamMembers.length > 0) {
        setIsLoadingTeamMembers(true);
        console.log("Loading team members for project list:", project.id, "Team member IDs:", project.teamMembers);

        try {
          const response = await databases.listDocuments(DATABASE_ID, 'team_members', [
            Query.equal('$id', project.teamMembers)
          ]);
          const teamMembersData = response.documents;

          console.log("Fetched team members data for project list:", teamMembersData);
          const transformedMembers: TeamMember[] = (teamMembersData || []).map((member): TeamMember => ({
            id: member.$id,
            user_id: member.user_id,
            name: member.name,
            position: member.position as any,
            skills: member.skills || [],
            startDate: new Date(member.start_date),
            createdAt: new Date(member.$createdAt)
          }));
          setAssignedTeamMembers(transformedMembers);
        } catch (error) {
          console.error("Error loading team members for project list:", error);
        } finally {
          setIsLoadingTeamMembers(false);
        }
      } else {
        console.log("No team members assigned to project in list:", project.id);
        setAssignedTeamMembers([]);
      }
    };

    loadTeamMembers();
  }, [project.teamMembers, project.id]);

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
        {isLoadingTeamMembers ? (
          <span className="text-muted-foreground text-xs">Loading...</span>
        ) : (
          <TeamMembersCell teamMembers={assignedTeamMembers} />
        )}
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
