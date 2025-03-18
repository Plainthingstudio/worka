
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProjectForm from "@/components/ProjectForm";
import { Client, Project, TeamMember } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface EditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  project: Project;
  clients: Client[];
  teamMembers?: TeamMember[];
}

const EditProjectDialog = ({
  isOpen,
  onClose,
  onSave,
  project,
  clients,
  teamMembers: providedTeamMembers,
}: EditProjectDialogProps) => {
  // Fetch team members from Supabase only if not provided as props
  const { data: fetchedTeamMembers = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (providedTeamMembers) return providedTeamMembers;
      
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) {
        console.error("Error fetching team members:", error);
        return [];
      }
      
      return data;
    },
    enabled: isOpen && !providedTeamMembers,
  });

  // Use provided team members or fetched ones
  const teamMembers = providedTeamMembers || fetchedTeamMembers;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to the project details.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {isLoading && !providedTeamMembers ? (
            <div className="flex justify-center p-4">
              <p>Loading team members...</p>
            </div>
          ) : (
            <ProjectForm
              project={project}
              clients={clients}
              teamMembers={teamMembers}
              onSave={onSave}
              onCancel={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
