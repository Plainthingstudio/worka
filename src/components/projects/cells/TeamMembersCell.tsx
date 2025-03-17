
import React from "react";
import { Users } from "lucide-react";
import { TeamMember } from "@/types";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface TeamMembersCellProps {
  teamMembers: TeamMember[];
}

const TeamMembersCell = ({ teamMembers }: TeamMembersCellProps) => {
  if (teamMembers.length === 0) {
    return <span className="text-muted-foreground text-xs">None</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 text-sm text-muted-foreground cursor-help">
            <Users className="h-3.5 w-3.5" />
            {teamMembers.length}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" sideOffset={5}>
          <p className="font-medium">Assigned Team Members:</p>
          <ul className="text-xs mt-1">
            {teamMembers.map(member => (
              <li key={member.id}>• {member.name} ({member.position})</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TeamMembersCell;
