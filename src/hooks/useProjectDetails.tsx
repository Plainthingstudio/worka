
import { useProjectData } from "./useProjectData";
import { useProjectDialogs } from "./useProjectDialogs";
import { useProjectOperations } from "./useProjectOperations";
import { usePaymentOperations } from "./usePaymentOperations";
import { useStatisticsData } from "./useStatisticsData";
import { ProjectStatus } from "@/types";

export const useProjectDetails = (projectId: string | undefined) => {
  const { project, setProject, client, isLoading: projectLoading, refetchClient } = useProjectData(projectId);
  const { teamMembers, isLoading: statisticsLoading } = useStatisticsData();
  
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

  return {
    project,
    client,
    teamMembers,
    currentPayment,
    selectedStatus,
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    isPaymentDialogOpen,
    isEditPaymentDialogOpen,
    isDeletePaymentDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsStatusDialogOpen,
    setIsPaymentDialogOpen,
    setIsEditPaymentDialogOpen,
    setIsDeletePaymentDialogOpen,
    setSelectedStatus,
    handleEditProject,
    handleDeleteProject,
    handleMarkAsCompleted,
    handleChangeStatus,
    handleAddPayment,
    handleEditPayment,
    handleDeletePayment,
    openEditPaymentDialog,
    openDeletePaymentDialog,
    isLoading: projectLoading || statisticsLoading,
    refetchClient,
    showConfetti
  };
};
