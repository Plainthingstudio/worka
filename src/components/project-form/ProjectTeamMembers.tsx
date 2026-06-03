
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TeamMember } from "@/types";
import { ProjectFormValues } from "./projectFormSchema";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import TeamMemberMultiSelect from "@/components/team/TeamMemberMultiSelect";

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
          <TeamMemberMultiSelect
            teamMembers={teamMembers}
            selectedIds={selectedTeamMembers}
            onChange={setSelectedTeamMembers}
            placeholder="Select team members"
          />
          <FormMessage />
        </FormItem>
      )} 
    />
  );
};

export default ProjectTeamMembers;
