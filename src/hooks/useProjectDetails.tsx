
import { useProjectData } from "./useProjectData";
import { useProjectDialogs } from "./useProjectDialogs";
import { useProjectOperations } from "./useProjectOperations";
import { usePaymentOperations } from "./usePaymentOperations";
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
    isPaymentDialogOpen,
    isEditPaymentDialogOpen,
    isDeletePaymentDialogOpen,
    currentPayment,
    selectedStatus,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setIsPaymentDialogOpen,
    setIsEditPaymentDialogOpen,
    setIsDeletePaymentDialogOpen,
    setSelectedStatus,
    setCurrentPayment,
    openEditPaymentDialog,
    openDeletePaymentDialog
  } = useProjectDialogs();

  const {
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus: changeProjectStatus,
    showConfetti
  } = useProjectOperations(project, setProject, refetchClient);

  const {
    handleAddPayment,
    handleEditPayment: editPayment,
    handleDeletePayment: deletePayment
  } = usePaymentOperations(
    project, 
    setProject, 
    () => setIsPaymentDialogOpen(false) // Close dialog on success
  );

  // Wrapper functions to connect dialogs with operations
  const handleChangeStatus = () => {
    changeProjectStatus(selectedStatus);
    setIsStatusDialogOpen(false);
  };

  const handleEditPayment = (data: any) => {
    editPayment(data, currentPayment?.id || null);
    setCurrentPayment(null);
    setIsEditPaymentDialogOpen(false);
  };

  const handleDeletePayment = () => {
    deletePayment(currentPayment?.id || null);
    setCurrentPayment(null);
    setIsDeletePaymentDialogOpen(false);
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
    currentPayment,
    selectedStatus,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    isPaymentDialogOpen,
    isEditPaymentDialogOpen,
    isDeletePaymentDialogOpen,
    isCreateTaskDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setIsPaymentDialogOpen,
    setIsEditPaymentDialogOpen,
    setIsDeletePaymentDialogOpen,
    setIsCreateTaskDialogOpen,
    setSelectedStatus,
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus,
    handleAddPayment,
    handleEditPayment,
    handleDeletePayment,
    handleCreateTask,
    handleCreateTaskSubmit,
    openEditPaymentDialog,
    openDeletePaymentDialog,
    isLoading: projectLoading || statisticsLoading,
    isCreatingTask,
    refetchClient,
    showConfetti
  };
};
