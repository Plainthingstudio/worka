import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ProjectHeader from "@/components/project-details/ProjectHeader";
import ProjectInfo from "@/components/project-details/ProjectInfo";
import PaymentSummary from "@/components/project-details/PaymentSummary";
import PaymentHistory from "@/components/project-details/PaymentHistory";
import ProjectFilesSection from "@/components/project-details/ProjectFilesSection";
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
    onCreateTaskSubmit: (data: ProjectFormValues) => boolean | Promise<boolean>;
  };
  isCreatingTask?: boolean;
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
  isCreatingTask = false,
}: ProjectContentProps) => {
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");
  const [myTasksOnly, setMyTasksOnly] = useState(true);

  return (
    <div className="project-content" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <ProjectHeader
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        onMarkAsCompleted={onMarkAsCompleted}
        onChangeStatus={onChangeStatus}
        onCreateTask={onCreateTask}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="flex flex-wrap items-center gap-3 max-lg:flex-nowrap max-lg:overflow-hidden">
          <ProjectTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab !== "overview" && (
            <label
              className="inline-flex items-center border border-border-soft bg-card text-foreground"
              style={{
                gap: 8,
                height: 36,
                padding: "0 12px",
                borderRadius: 12,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
              }}
            >
              <Switch
                checked={myTasksOnly}
                onCheckedChange={setMyTasksOnly}
                className="h-5 w-9 data-[state=checked]:bg-brand [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
              />
              <span>My task</span>
            </label>
          )}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
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
            <div className="min-w-0 xl:self-stretch">
              <ProjectFilesSection projectId={project.id} stretch />
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <ProjectTasksView
            projectId={project.id}
            view={activeTab}
            onCreateTask={onCreateTask}
            myTasksOnly={myTasksOnly}
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
        isSubmitting={isCreatingTask}
      />
    </div>
  );
};

export default ProjectContent;
