
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectForm from "@/components/ProjectForm";
import PaymentForm from "@/components/PaymentForm";
import { Client, Project, Payment, ProjectStatus } from "@/types";

interface ProjectDialogsProps {
  project: Project;
  clients: Client[];
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
      <Dialog open={isEditDialogOpen} onOpenChange={onCloseEditDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Make changes to the project details.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[calc(85vh-120px)] overflow-y-auto pr-2">
            <ProjectForm
              project={project}
              clients={clients}
              onSave={onEditProject}
              onCancel={onCloseEditDialog}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={onDeleteProject}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={onCloseDeleteDialog}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={onCloseStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Project Status</DialogTitle>
            <DialogDescription>
              Select a new status for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select 
              value={selectedStatus} 
              onValueChange={(value) => onStatusChange(value as ProjectStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In progress">In progress</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onCloseStatusDialog}
            >
              Cancel
            </Button>
            <Button
              onClick={onChangeStatus}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentDialogOpen} onOpenChange={onClosePaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
            <DialogDescription>
              Record a new payment for this project.
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            projectId={project.id}
            currency={project.currency}
            onSave={onAddPayment}
            onCancel={onClosePaymentDialog}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPaymentDialogOpen} onOpenChange={onCloseEditPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update payment details.
            </DialogDescription>
          </DialogHeader>
          {currentPayment && (
            <PaymentForm
              projectId={project.id}
              currency={project.currency}
              payment={currentPayment}
              onSave={onEditPayment}
              onCancel={onCloseEditPaymentDialog}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeletePaymentDialogOpen} onOpenChange={onCloseDeletePaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Payment Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={onDeletePayment}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={onCloseDeletePaymentDialog}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectDialogs;
