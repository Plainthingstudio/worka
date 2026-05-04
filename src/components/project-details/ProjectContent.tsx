import React, { useState } from "react";
import ProjectHeader from "@/components/project-details/ProjectHeader";
import ProjectInfo from "@/components/project-details/ProjectInfo";
import PaymentSummary from "@/components/project-details/PaymentSummary";
import PaymentHistory from "@/components/project-details/PaymentHistory";
import ProjectDialogs from "@/components/project-details/ProjectDialogs";
import ProjectTabs, { ProjectTab } from "@/components/project-details/ProjectTabs";
import ProjectTasksView from "@/components/project-details/ProjectTasksView";
import { CreateTaskFromProjectDialog } from "@/components/project-details/CreateTaskFromProjectDialog";
import { Project, Client, ProjectStatus } from "@/types";

type ProjectFormValues = Record<string, unknown>;

interface ProjectContentProps {
  project: Project;
  client: Client;
  dialogState: {
    isEditDialogOpen: boolean;
    isDeleteDialogOpen: boolean;
    isStatusDialogOpen: boolean;
    isCreateTaskDialogOpen: boolean;
  };
  selectedStatus: ProjectStatus;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsCompleted: () => void;
  onChangeStatus: () => void;
  onCreateTask: () => void;
  handlers: {
    onCloseEditDialog: () => void;
    onCloseDeleteDialog: () => void;
    onCloseStatusDialog: () => void;
    onCloseCreateTaskDialog: () => void;
    onEditProject: (data: ProjectFormValues) => void;
    onDeleteProject: () => void;
    onChangeStatusSubmit: () => void;
    onStatusChange: (status: ProjectStatus) => void;
    onCreateTaskSubmit: (data: ProjectFormValues) => void;
  };
}

const ProjectContent = ({
  project,
  client,
  dialogState,
  selectedStatus,
  onEdit,
  onDelete,
  onMarkAsCompleted,
  onChangeStatus,
  onCreateTask,
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
                <PaymentSummary project={project} />
              </div>
              <div style={{ flex: "1 1 0", minWidth: 0 }}>
                <PaymentHistory project={project} />
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
        selectedStatus={selectedStatus}
        isEditDialogOpen={dialogState.isEditDialogOpen}
        isDeleteDialogOpen={dialogState.isDeleteDialogOpen}
        isStatusDialogOpen={dialogState.isStatusDialogOpen}
        onCloseEditDialog={handlers.onCloseEditDialog}
        onCloseDeleteDialog={handlers.onCloseDeleteDialog}
        onCloseStatusDialog={handlers.onCloseStatusDialog}
        onEditProject={handlers.onEditProject}
        onDeleteProject={handlers.onDeleteProject}
        onChangeStatus={handlers.onChangeStatusSubmit}
        onStatusChange={handlers.onStatusChange}
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
