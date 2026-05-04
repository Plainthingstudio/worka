
import React from "react";
import { Client, Project, ProjectStatus } from "@/types";
import EditProjectDialog from "./dialogs/EditProjectDialog";
import DeleteProjectDialog from "./dialogs/DeleteProjectDialog";
import ChangeStatusDialog from "./dialogs/ChangeStatusDialog";

type ProjectFormValues = Record<string, unknown>;

interface ProjectDialogsProps {
  project: Project;
  clients: Client[];
  selectedStatus: ProjectStatus;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isStatusDialogOpen: boolean;
  onCloseEditDialog: () => void;
  onCloseDeleteDialog: () => void;
  onCloseStatusDialog: () => void;
  onEditProject: (data: ProjectFormValues) => void;
  onDeleteProject: () => void;
  onChangeStatus: () => void;
  onStatusChange: (status: ProjectStatus) => void;
}

const ProjectDialogs = ({
  project,
  clients,
  selectedStatus,
  isEditDialogOpen,
  isDeleteDialogOpen,
  isStatusDialogOpen,
  onCloseEditDialog,
  onCloseDeleteDialog,
  onCloseStatusDialog,
  onEditProject,
  onDeleteProject,
  onChangeStatus,
  onStatusChange,
}: ProjectDialogsProps) => {
  return (
    <>
      <EditProjectDialog 
        isOpen={isEditDialogOpen}
        onClose={onCloseEditDialog}
        onSave={onEditProject}
        project={project}
        clients={clients}
      />

      <DeleteProjectDialog
        isOpen={isDeleteDialogOpen}
        onClose={onCloseDeleteDialog}
        onConfirm={onDeleteProject}
      />

      <ChangeStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={onCloseStatusDialog}
        onSave={onChangeStatus}
        selectedStatus={selectedStatus}
        onStatusChange={onStatusChange}
      />
    </>
  );
};

export default ProjectDialogs;
