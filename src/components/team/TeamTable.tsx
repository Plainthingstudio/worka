
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamMember } from "@/types";
import TeamMemberItem from "./TeamMember";

interface TeamTableProps {
  members: TeamMember[];
  onEdit?: (member: TeamMember) => void;
  onDelete?: (id: string) => void;
}

const TeamTable = ({ members, onEdit, onDelete }: TeamTableProps) => {
  const showActions = onEdit || onDelete;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position & Role</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>Skills</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={showActions ? 5 : 4}
              className="h-24 text-center text-muted-foreground"
            >
              No team members found.
            </TableCell>
          </TableRow>
        ) : (
          members.map((member) => (
            <TeamMemberItem 
              key={member.id}
              member={member}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TeamTable;
