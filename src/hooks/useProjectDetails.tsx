
import { useProjectData } from "./useProjectData";
import { useProjectDialogs } from "./useProjectDialogs";
import { useProjectOperations } from "./useProjectOperations";
import { useStatisticsData } from "./useStatisticsData";
import { useProjectToTask } from "./useProjectToTask";
import { useTasks } from "./useTasks";
import { ProjectStatus } from "@/types";
import { useState } from "react";

export const useProjectDetails = (projectId: string | undefined) => {
  const { project, setProject, client, isLoading: projectLoading, refetchClient } = useProjectData(projectId);
  const { teamMembers, isLoading: statisticsLoading } = useStatisticsData();
  const { createTaskFromProject, isCreating: isCreatingTask } = useProjectToTask();
  const { tasks, isLoading: isTasksLoading, fetchTasks } = useTasks(projectId || '');
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  
  const {
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    selectedStatus,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setSelectedStatus,
  } = useProjectDialogs();

  const {
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus: changeProjectStatus,
    showConfetti
  } = useProjectOperations(project, setProject, refetchClient);

  // Wrapper functions to connect dialogs with operations
  const handleChangeStatus = () => {
    changeProjectStatus(selectedStatus);
    setIsStatusDialogOpen(false);
  };

  const handleCreateTask = () => {
    setIsCreateTaskDialogOpen(true);
  };

  const handleCreateTaskSubmit = async (data: any) => {
    if (!project) return;
    
    console.log('Creating task with form data:', data);
    
    const task = await createTaskFromProject({
      ...project,
      ...data // Override with form data
    });
    
    if (task) {
      console.log('Task created, closing dialog and refreshing tasks');
      setIsCreateTaskDialogOpen(false);
      // Refresh tasks list after creating a new task
      await fetchTasks();
    }
  };

  return {
    project,
    client,
    teamMembers,
    tasks,
    isTasksLoading,
    selectedStatus,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    isCreateTaskDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setIsCreateTaskDialogOpen,
    setSelectedStatus,
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus,
    handleCreateTask,
    handleCreateTaskSubmit,
    isLoading: projectLoading || statisticsLoading,
    isCreatingTask,
    refetchClient,
    showConfetti
  };
};
