
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProjectForm from "@/components/ProjectForm";
import { Client, Project, TeamMember, TeamPosition, LeadSource } from "@/types";
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
  teamMembers: providedTeamMembers,
}: EditProjectDialogProps) => {
  // Fetch all clients
  const { data: allClients = [], isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) {
        console.error("Error fetching clients:", error);
        return [];
      }
      
      return data.map((client): Client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        leadSource: (client.lead_source as LeadSource) || "Website",
        createdAt: new Date(client.created_at)
      }));
    },
    enabled: isOpen,
  });

  const { data: fetchedTeamMembers = [], isLoading: isLoadingTeamMembers } = useQuery({
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
      
      return data.map((member): TeamMember => ({
        id: member.id,
        name: member.name,
        position: member.position as TeamPosition,
        skills: member.skills || [],
        startDate: new Date(member.start_date),
        createdAt: new Date(member.created_at)
      }));
    },
    enabled: isOpen && !providedTeamMembers,
  });

  const teamMembers = providedTeamMembers || fetchedTeamMembers;

  const handleSave = async (data: any) => {
    await onSave(data);
    onClose();
  };

  const isLoading = isLoadingClients || isLoadingTeamMembers;

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
          {isLoading ? (
            <div className="flex justify-center p-4">
              <p>Loading...</p>
            </div>
          ) : (
            <ProjectForm
              project={project}
              clients={allClients}
              teamMembers={teamMembers}
              onSave={handleSave}
              onCancel={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProjectDialog;
