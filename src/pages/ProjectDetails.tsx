
import React from "react";
import { useParams } from "react-router-dom";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import ProjectDetailsLayout from "@/components/project-details/ProjectDetailsLayout";
import ProjectContent from "@/components/project-details/ProjectContent";
import ProjectsLoading from "@/components/projects/ProjectsLoading";
import Lottie from "lottie-react";

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  const {
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
    isLoading,
    refetchClient,
    showConfetti
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
    onEditProject: (data: any) => handleEditProject(data),
    onDeleteProject: handleDeleteProject,
    onChangeStatusSubmit: handleChangeStatus,
    onStatusChange: (status: any) => setSelectedStatus(status),
    onAddPaymentSubmit: handleAddPayment,
    onEditPaymentSubmit: handleEditPayment,
    onDeletePaymentSubmit: handleDeletePayment,
  };

  return (
    <ProjectDetailsLayout 
      title="Project Details" 
      isLoading={isLoading}
    >
      {isLoading ? (
        <ProjectsLoading />
      ) : (
        project && client ? (
          <>
            {showConfetti && (
              <div className="fixed inset-0 z-50 pointer-events-none">
                <Lottie
                  animationData={"https://lottie.host/c0b936d0-8660-4cae-bcbd-b18f19933fb1/vlT7zSzyGL.lottie"}
                  loop={true}
                  autoplay={true}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            )}
            <ProjectContent
              project={project}
              client={client}
              teamMembers={teamMembers}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <h2 className="text-xl font-semibold">Project not found</h2>
            </div>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
            <a href="/projects" className="text-primary hover:underline">Return to Projects</a>
          </div>
        )
      )}
    </ProjectDetailsLayout>
  );
};

export default ProjectDetails;
