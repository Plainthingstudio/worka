
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types";
import { databases, DATABASE_ID } from "@/integrations/appwrite/client";
import { useState } from "react";
import {
  getCurrentUserId,
  notifyProjectAssigneeChanges,
  notifyProjectFollowers,
} from "@/services/notificationService";

export const useProjectOperations = (project: Project | null, setProject: (project: Project) => void, refetchClient?: () => void) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleEditProject = async (data: any) => {
    if (!project) return;

    try {
      const actorId = await getCurrentUserId();
      console.log("Updating project with data:", data);
      console.log("Team members being saved:", data.teamMembers);

      await databases.updateDocument(DATABASE_ID, 'projects', project.id, {
        name: data.name,
        client_id: data.clientId,
        status: data.status,
        deadline: data.deadline.toISOString(),
        fee: data.fee,
        currency: data.currency,
        project_type: data.projectType,
        service_ids: data.serviceIds || [],
        sub_service_ids: data.subServiceIds || [],
        service_quantities: data.serviceQuantities || [],
        sub_service_quantities: data.subServiceQuantities || [],
        team_members: data.teamMembers || []
      });
      const oldTeamMembers = project.teamMembers || [];
      const newTeamMembers = data.teamMembers || [];
      await notifyProjectAssigneeChanges({
        project: project.id,
        addedTeamMemberIds: newTeamMembers.filter((id: string) => !oldTeamMembers.includes(id)),
        removedTeamMemberIds: oldTeamMembers.filter((id: string) => !newTeamMembers.includes(id)),
        actorId,
      });

      if (data.status !== project.status) {
        await notifyProjectFollowers({
          project: project.id,
          type: "project_status_changed",
          title: "Project status updated",
          message: `Project "${project.name}" status changed to ${data.status}`,
          actorId,
          data: { old_status: project.status, new_status: data.status },
        });
      }

      if (data.deadline?.getTime?.() !== project.deadline?.getTime?.()) {
        await notifyProjectFollowers({
          project: project.id,
          type: "project_deadline_changed",
          title: "Project deadline updated",
          message: `Project "${project.name}" deadline was updated`,
          actorId,
          data: {
            old_deadline: project.deadline?.toISOString?.(),
            new_deadline: data.deadline?.toISOString?.(),
          },
        });
      }

      const updatedProject = {
        ...project,
        name: data.name,
        clientId: data.clientId,
        status: data.status,
        deadline: data.deadline,
        fee: data.fee,
        currency: data.currency,
        projectType: data.projectType,
        serviceIds: data.serviceIds || [],
        subServiceIds: data.subServiceIds || [],
        serviceQuantities: data.serviceQuantities || [],
        subServiceQuantities: data.subServiceQuantities || [],
        teamMembers: data.teamMembers || []
      };

      console.log("Updated project with team members:", updatedProject.teamMembers);
      setProject(updatedProject);

      // Refetch client data if the client ID has changed
      if (data.clientId !== project.clientId && refetchClient) {
        refetchClient();
      }

      toast.success("Project updated successfully");
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    try {
      await databases.deleteDocument(DATABASE_ID, 'projects', project.id);

      toast.success("Project deleted successfully");
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("Failed to delete project");
      return false;
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!project) return;

    try {
      const actorId = await getCurrentUserId();
      await databases.updateDocument(DATABASE_ID, 'projects', project.id, {
        status: 'Completed'
      });
      await notifyProjectFollowers({
        project: project.id,
        type: "project_status_changed",
        title: "Project status updated",
        message: `Project "${project.name}" status changed to Completed`,
        actorId,
        data: { old_status: project.status, new_status: "Completed" },
      });

      const updatedProject = { ...project, status: "Completed" as ProjectStatus };
      setProject(updatedProject);

      // Show confetti animation
      setShowConfetti(true);
      console.log("Setting showConfetti to true");

      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
        console.log("Setting showConfetti to false");
      }, 5000);

      toast.success("Project marked as completed");
    } catch (error) {
      console.error('Error marking project as completed:', error);
      toast.error("Failed to mark project as completed");
    }
  };

  const handleChangeStatus = async (selectedStatus: ProjectStatus) => {
    if (!project) return;

    try {
      const actorId = await getCurrentUserId();
      await databases.updateDocument(DATABASE_ID, 'projects', project.id, {
        status: selectedStatus
      });
      if (selectedStatus !== project.status) {
        await notifyProjectFollowers({
          project: project.id,
          type: "project_status_changed",
          title: "Project status updated",
          message: `Project "${project.name}" status changed to ${selectedStatus}`,
          actorId,
          data: { old_status: project.status, new_status: selectedStatus },
        });
      }

      const updatedProject = { ...project, status: selectedStatus };
      setProject(updatedProject);
      toast.success(`Project status changed to ${selectedStatus}`);
    } catch (error) {
      console.error('Error changing project status:', error);
      toast.error("Failed to change project status");
    }
  };

  return {
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus,
    showConfetti,
    setShowConfetti
  };
};
