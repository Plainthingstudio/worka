
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
import { databases, DATABASE_ID } from "@/integrations/appwrite/client";

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
      const response = await databases.listDocuments(DATABASE_ID, 'clients');

      return response.documents.map((client): Client => ({
        id: client.$id,
        name: client.name,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        leadSource: (client.lead_source as LeadSource) || "Website",
        createdAt: new Date(client.$createdAt)
      }));
    },
    enabled: isOpen,
  });

  const { data: fetchedTeamMembers = [], isLoading: isLoadingTeamMembers } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      if (providedTeamMembers) return providedTeamMembers;

      const response = await databases.listDocuments(DATABASE_ID, 'team_members');

      return response.documents.map((member): TeamMember => ({
        id: member.$id,
        user_id: member.user_id,
        name: member.name,
        position: member.position as TeamPosition,
        skills: member.skills || [],
        startDate: new Date(member.start_date),
        createdAt: new Date(member.$createdAt)
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
