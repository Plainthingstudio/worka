
import React from "react";
import { useParams } from "react-router-dom";
import { useProjectDetails } from "@/hooks/useProjectDetails";
import ProjectDetailsLayout from "@/components/project-details/ProjectDetailsLayout";
import ProjectContent from "@/components/project-details/ProjectContent";
import ProjectsLoading from "@/components/projects/ProjectsLoading";
import Lottie from "lottie-react";
import confettiAnimation from "@/assets/confetti-animation.json";

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
              <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
                <Lottie
                  animationData={{
                    "v": "5.5.7",
                    "fr": 30,
                    "ip": 0,
                    "op": 180,
                    "w": 1920,
                    "h": 1080,
                    "nm": "confetti",
                    "ddd": 0,
                    "assets": [],
                    "layers": [
                      {
                        "ddd": 0,
                        "ind": 1,
                        "ty": 4,
                        "nm": "confetti",
                        "sr": 1,
                        "ks": {
                          "o": {"a": 0, "k": 100},
                          "r": {"a": 0, "k": 0},
                          "p": {"a": 0, "k": [960, 540, 0]},
                          "a": {"a": 0, "k": [0, 0, 0]},
                          "s": {"a": 0, "k": [100, 100, 100]}
                        },
                        "ao": 0,
                        "shapes": [
                          {
                            "ty": "gr",
                            "it": [
                              {
                                "ty": "rc",
                                "d": 1,
                                "s": {"a": 0, "k": [20, 20]},
                                "p": {"a": 0, "k": [0, 0]},
                                "r": {"a": 0, "k": 0},
                                "nm": "Rectangle Path",
                                "mn": "ADBE Vector Shape - Rect"
                              },
                              {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.9, 0.2, 0.2, 1]},
                                "o": {"a": 0, "k": 100},
                                "r": 1,
                                "nm": "Fill 1",
                                "mn": "ADBE Vector Graphic - Fill"
                              },
                              {
                                "ty": "rp",
                                "c": {"a": 0, "k": 50},
                                "o": {"a": 0, "k": 0},
                                "m": 1,
                                "a": {"a": 0, "k": 0},
                                "ix": 3,
                                "tr": {
                                  "ty": "tr",
                                  "p": {"a": 1, "k": [{"t": 0, "s": [0, -500], "i": {"x": 0.4, "y": 0}, "o": {"x": 0.6, "y": 1}, "e": [0, 500]}, {"t": 120}]},
                                  "a": {"a": 0, "k": [0, 0]},
                                  "s": {"a": 0, "k": [100, 100]},
                                  "r": {"a": 1, "k": [{"t": 0, "s": [0], "i": {"x": 0.4, "y": 0}, "o": {"x": 0.6, "y": 1}, "e": [360]}, {"t": 120}]},
                                  "o": {"a": 0, "k": 100},
                                  "sk": {"a": 0, "k": 0},
                                  "sa": {"a": 0, "k": 0}
                                },
                                "nm": "Transform",
                                "mn": "ADBE Vector Group"
                              }
                            ],
                            "nm": "Rectangle",
                            "np": 3,
                            "cix": 2,
                            "ix": 1,
                            "mn": "ADBE Vector Group"
                          }
                        ],
                        "ip": 0,
                        "op": 180,
                        "st": 0,
                        "bm": 0
                      }
                    ]
                  }}
                  loop={true}
                  autoplay={true}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
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
