
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
}

const EditProjectDialog = ({
  isOpen,
  onClose,
  onSave,
  project,
  clients,
}: EditProjectDialogProps) => {
  // Fetch team members from Supabase
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*');
      
      if (error) {
        console.error("Error fetching team members:", error);
        return [];
      }
      
      return data.map((member: any): TeamMember => ({
        id: member.id,
        name: member.name,
        position: member.position,
        skills: member.skills || [],
        startDate: new Date(member.start_date),
        createdAt: new Date(member.created_at)
      }));
    },
  });

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
          <ProjectForm
            project={project}
            clients={clients}
            teamMembers={teamMembers}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
