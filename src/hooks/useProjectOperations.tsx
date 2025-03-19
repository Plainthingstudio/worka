
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const useProjectOperations = (project: Project | null, setProject: (project: Project) => void, refetchClient?: () => void) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const handleEditProject = async (data: any) => {
    if (!project) return;

    try {
      // Update the project in Supabase
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          name: data.name,
          client_id: data.clientId,
          status: data.status,
          deadline: data.deadline.toISOString(),
          fee: data.fee,
          currency: data.currency,
          project_type: data.projectType,
          categories: data.categories,
          team_members: data.teamMembers || []
        })
        .eq('id', project.id);

      if (updateError) throw updateError;

      const updatedProject = { ...project, ...data };
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('projects')
        .update({ status: 'Completed' })
        .eq('id', project.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('projects')
        .update({ status: selectedStatus })
        .eq('id', project.id);

      if (error) throw error;

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
