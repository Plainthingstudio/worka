
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { User, X } from "lucide-react";
import { TeamMember } from "@/types";
import { ProjectFormValues } from "./projectFormSchema";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ProjectTeamMembersProps {
  form: UseFormReturn<ProjectFormValues>;
  teamMembers: TeamMember[];
  selectedTeamMembers: string[];
  setSelectedTeamMembers: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProjectTeamMembers = ({ 
  form, 
  teamMembers, 
  selectedTeamMembers, 
  setSelectedTeamMembers 
}: ProjectTeamMembersProps) => {
  
  const handleTeamMemberSelect = (memberId: string) => {
    if (!selectedTeamMembers.includes(memberId)) {
      setSelectedTeamMembers([...selectedTeamMembers, memberId]);
    }
  };

  const removeTeamMember = (memberId: string) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== memberId));
  };

  const getTeamMemberNameById = (id: string): string => {
    const member = teamMembers.find(m => m.id === id);
    return member ? `${member.name} - ${member.position}` : "Unknown member";
  };

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <FormField 
      control={form.control} 
      name="teamMembers" 
      render={() => (
        <FormItem>
          <FormLabel>Assign Team Members</FormLabel>
          <div className="space-y-4">
            <Select 
              onValueChange={handleTeamMemberSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select team members" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers
                  .filter(member => !selectedTeamMembers.includes(member.id))
                  .map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {member.name} - <span className="text-muted-foreground text-xs">{member.position}</span>
                      </div>
                    </SelectItem>
                  ))
                }
                {teamMembers.length === 0 ||
                  (teamMembers.length === selectedTeamMembers.length && (
                    <SelectItem value="none" disabled>
                      No more team members available
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTeamMembers.map(memberId => (
                <Badge key={memberId} variant="category" className="flex items-center gap-1 py-1 pl-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                  {getTeamMemberNameById(memberId)}
                  <button 
                    type="button" 
                    onClick={() => removeTeamMember(memberId)}
                    className="ml-1 rounded-full text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {getTeamMemberNameById(memberId)}</span>
                  </button>
                </Badge>
              ))}
              {selectedTeamMembers.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No team members assigned yet. Select members from the dropdown above.
                </div>
              )}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )} 
    />
  );
};

export default ProjectTeamMembers;
