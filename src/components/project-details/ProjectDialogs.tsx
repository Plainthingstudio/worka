
import React from "react";
import { Client, Project, Payment, ProjectStatus, TeamMember } from "@/types";
import EditProjectDialog from "./dialogs/EditProjectDialog";
import DeleteProjectDialog from "./dialogs/DeleteProjectDialog";
import ChangeStatusDialog from "./dialogs/ChangeStatusDialog";
import AddPaymentDialog from "./dialogs/AddPaymentDialog";
import EditPaymentDialog from "./dialogs/EditPaymentDialog";
import DeletePaymentDialog from "./dialogs/DeletePaymentDialog";

interface ProjectDialogsProps {
  project: Project;
  clients: Client[];
  teamMembers?: TeamMember[]; // Added teamMembers as optional prop
  currentPayment: Payment | null;
  selectedStatus: ProjectStatus;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isStatusDialogOpen: boolean;
  isPaymentDialogOpen: boolean;
  isEditPaymentDialogOpen: boolean;
  isDeletePaymentDialogOpen: boolean;
  onCloseEditDialog: () => void;
  onCloseDeleteDialog: () => void;
  onCloseStatusDialog: () => void;
  onClosePaymentDialog: () => void;
  onCloseEditPaymentDialog: () => void;
  onCloseDeletePaymentDialog: () => void;
  onEditProject: (data: any) => void;
  onDeleteProject: () => void;
  onChangeStatus: () => void;
  onStatusChange: (status: ProjectStatus) => void;
  onAddPayment: (data: any) => void;
  onEditPayment: (data: any) => void;
  onDeletePayment: () => void;
}

const ProjectDialogs = ({
  project,
  clients,
  teamMembers,
  currentPayment,
  selectedStatus,
  isEditDialogOpen,
  isDeleteDialogOpen,
  isStatusDialogOpen,
  isPaymentDialogOpen,
  isEditPaymentDialogOpen,
  isDeletePaymentDialogOpen,
  onCloseEditDialog,
  onCloseDeleteDialog,
  onCloseStatusDialog,
  onClosePaymentDialog,
  onCloseEditPaymentDialog,
  onCloseDeletePaymentDialog,
  onEditProject,
  onDeleteProject,
  onChangeStatus,
  onStatusChange,
  onAddPayment,
  onEditPayment,
  onDeletePayment,
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

      <AddPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={onClosePaymentDialog}
        onSave={onAddPayment}
        project={project}
      />

      <EditPaymentDialog
        isOpen={isEditPaymentDialogOpen}
        onClose={onCloseEditPaymentDialog}
        onSave={onEditPayment}
        project={project}
        payment={currentPayment}
      />

      <DeletePaymentDialog
        isOpen={isDeletePaymentDialogOpen}
        onClose={onCloseDeletePaymentDialog}
        onConfirm={onDeletePayment}
      />
    </>
  );
};

export default ProjectDialogs;
