import React, { useState } from "react";
import ProjectHeader from "@/components/project-details/ProjectHeader";
import ProjectInfo from "@/components/project-details/ProjectInfo";
import PaymentSummary from "@/components/project-details/PaymentSummary";
import PaymentHistory from "@/components/project-details/PaymentHistory";
import ProjectDialogs from "@/components/project-details/ProjectDialogs";
import ProjectTabs, { ProjectTab } from "@/components/project-details/ProjectTabs";
import ProjectTasksView from "@/components/project-details/ProjectTasksView";
import { CreateTaskFromProjectDialog } from "@/components/project-details/CreateTaskFromProjectDialog";
import { Project, Client, Payment, ProjectStatus, TeamMember } from "@/types";
import { TaskWithRelations } from "@/types/task";

interface ProjectContentProps {
  project: Project;
  client: Client;
  teamMembers?: TeamMember[];
  currentPayment: Payment | null;
  tasks: TaskWithRelations[];
  isTasksLoading: boolean;
  dialogState: {
    isEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;
    isStatusDialogOpen: boolean;
    isPaymentDialogOpen: boolean;
    isEditPaymentDialogOpen: boolean;
    isDeletePaymentDialogOpen: boolean;
    isCreateTaskDialogOpen: boolean;
  };
  selectedStatus: ProjectStatus;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsCompleted: () => void;
  onChangeStatus: () => void;
  onCreateTask: () => void;
  onAddPayment: () => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  handlers: {
    onCloseEditDialog: () => void;
    onCloseDeleteDialog: () => void;
    onCloseStatusDialog: () => void;
    onClosePaymentDialog: () => void;
    onCloseEditPaymentDialog: () => void;
    onCloseDeletePaymentDialog: () => void;
    onCloseCreateTaskDialog: () => void;
    onEditProject: (data: any) => void;
    onDeleteProject: () => void;
    onChangeStatusSubmit: () => void;
    onStatusChange: (status: ProjectStatus) => void;
    onAddPaymentSubmit: (data: any) => void;
    onEditPaymentSubmit: (data: any) => void;
    onDeletePaymentSubmit: () => void;
    onCreateTaskSubmit: (data: any) => void;
  };
}

const ProjectContent = ({
  project,
  client,
  teamMembers,
  currentPayment,
  dialogState,
  selectedStatus,
  onEdit,
  onDelete,
  onMarkAsCompleted,
  onChangeStatus,
  onCreateTask,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
  handlers,
}: ProjectContentProps) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <ProjectHeader
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkAsCompleted={onMarkAsCompleted}
        onChangeStatus={onChangeStatus}
        onCreateTask={onCreateTask}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ProjectTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ProjectInfo project={project} client={client} />

            <div
              className="flex flex-col md:flex-row"
              style={{ gap: 8, width: "100%" }}
            >
              <div style={{ flex: "1 1 0", minWidth: 0, maxWidth: 485 }}>
                <PaymentSummary project={project} onAddPayment={onAddPayment} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 0 }}>
                <PaymentHistory
                  project={project}
                  onEditPayment={onEditPayment}
                  onDeletePayment={onDeletePayment}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <ProjectTasksView
            projectId={project.id}
            view={activeTab}
            onCreateTask={onCreateTask}
          />
        )}
      </div>

      <ProjectDialogs
        project={project}
        clients={[client]}
        teamMembers={teamMembers}
        currentPayment={currentPayment}
        selectedStatus={selectedStatus}
        isEditDialogOpen={dialogState.isEditDialogOpen}
        isDeleteDialogOpen={dialogState.isDeleteDialogOpen}
        isStatusDialogOpen={dialogState.isStatusDialogOpen}
        isPaymentDialogOpen={dialogState.isPaymentDialogOpen}
        isEditPaymentDialogOpen={dialogState.isEditPaymentDialogOpen}
        isDeletePaymentDialogOpen={dialogState.isDeletePaymentDialogOpen}
        onCloseEditDialog={handlers.onCloseEditDialog}
        onCloseDeleteDialog={handlers.onCloseDeleteDialog}
        onCloseStatusDialog={handlers.onCloseStatusDialog}
        onClosePaymentDialog={handlers.onClosePaymentDialog}
        onCloseEditPaymentDialog={handlers.onCloseEditPaymentDialog}
        onCloseDeletePaymentDialog={handlers.onCloseDeletePaymentDialog}
        onEditProject={handlers.onEditProject}
        onDeleteProject={handlers.onDeleteProject}
        onChangeStatus={handlers.onChangeStatusSubmit}
        onStatusChange={handlers.onStatusChange}
        onAddPayment={handlers.onAddPaymentSubmit}
        onEditPayment={handlers.onEditPaymentSubmit}
        onDeletePayment={handlers.onDeletePaymentSubmit}
      />

      <CreateTaskFromProjectDialog
        isOpen={dialogState.isCreateTaskDialogOpen}
        onClose={handlers.onCloseCreateTaskDialog}
        onSubmit={handlers.onCreateTaskSubmit}
        project={project}
      />
    </div>
  );
};

export default ProjectContent;
