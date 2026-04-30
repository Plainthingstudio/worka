
import React from "react";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import { TeamMember } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamMemberItemProps {
  member: TeamMember;
  onEdit?: (member: TeamMember) => void;
  onDelete?: (id: string) => void;
}

const TeamMemberItem = ({ member, onEdit, onDelete }: TeamMemberItemProps) => {
  const showActions = onEdit || onDelete;

  const getRoleBadgeVariant = (role?: string): React.ComponentProps<typeof Badge>["variant"] => {
    switch (role) {
      case 'owner':         return 'role-owner';
      case 'administrator': return 'role-administrator';
      case 'team':          return 'role-team';
      default:              return 'role-default';
    }
  };

  return (
    <TableRow key={member.id}>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{member.name}</span>
          {member.email && (
            <span className="text-xs text-muted-foreground">{member.email}</span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex flex-col gap-1">
          <span>{member.position}</span>
          {member.role && (
            <Badge variant={getRoleBadgeVariant(member.role)} className="w-fit">
              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
            </Badge>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        {format(new Date(member.startDate), "MMM dd, yyyy")}
      </TableCell>
      
      <TableCell>
        {member.skills && member.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 2).map((skill, index) => (
              <Badge key={index} variant="category" className="text-xs">
                {skill}
              </Badge>
            ))}
            
            {member.skills.length > 2 && (
              <Badge variant="category" className="text-xs">
                +{member.skills.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">No skills</span>
        )}
      </TableCell>
      
      {showActions && (
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            {onEdit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(member)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Team Member</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {onDelete && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onDelete(member.id)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Team Member</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};

export default TeamMemberItem;
