
import React from "react";
import { useParams } from "react-router-dom";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import ProjectDetailsLayout from "@/components/project-details/ProjectDetailsLayout";
import ProjectContent from "@/components/project-details/ProjectContent";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  const {
    project,
    client,
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
  } = useProjectDetails(projectId);

  const dialogState = {
    isEditDialogOpen,
    isDeleteDialogOpen,
    isStatusDialogOpen,
    isPaymentDialogOpen,
    isEditPaymentDialogOpen,
    isDeletePaymentDialogOpen
  };

  const handlers = {
    onCloseEditDialog: () => setIsEditDialogOpen(false),
    onCloseDeleteDialog: () => setIsDeleteDialogOpen(false),
    onCloseStatusDialog: () => setIsStatusDialogOpen(false),
    onClosePaymentDialog: () => setIsPaymentDialogOpen(false),
    onCloseEditPaymentDialog: () => {
      setIsEditPaymentDialogOpen(false);
    },
    onCloseDeletePaymentDialog: () => {
      setIsDeletePaymentDialogOpen(false);
    },
    onEditProject: handleEditProject,
    onDeleteProject: handleDeleteProject,
    onChangeStatusSubmit: handleChangeStatus,
    onStatusChange: (status: any) => setSelectedStatus(status),
    onAddPaymentSubmit: handleAddPayment,
    onEditPaymentSubmit: handleEditPayment,
    onDeletePaymentSubmit: handleDeletePayment,
  };

  if (!project || !client) {
    return (
      <ProjectDetailsLayout 
        title="Project Details" 
        isLoading={true}
      >
        {null}
      </ProjectDetailsLayout>
    );
  }

  return (
    <ProjectDetailsLayout 
      title="Project Details"
    >
      <ProjectContent
        project={project}
        client={client}
        currentPayment={currentPayment}
        dialogState={dialogState}
        selectedStatus={selectedStatus}
        onEdit={() => setIsEditDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onMarkAsCompleted={handleMarkAsCompleted}
        onChangeStatus={() => {
          setSelectedStatus("In progress");
          setIsStatusDialogOpen(true);
        }}
        onAddPayment={() => setIsPaymentDialogOpen(true)}
        onEditPayment={openEditPaymentDialog}
        onDeletePayment={openDeletePaymentDialog}
        handlers={handlers}
      />
    </ProjectDetailsLayout>
  );
};

export default ProjectDetails;
