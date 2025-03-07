
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PaymentForm from "@/components/PaymentForm";
import { Payment, Project } from "@/types";

interface EditPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  project: Project;
  payment: Payment | null;
}

const EditPaymentDialog = ({
  isOpen,
  onClose,
  onSave,
  project,
  payment,
}: EditPaymentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Update payment details.
          </DialogDescription>
        </DialogHeader>
        {payment && (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <PaymentForm
              projectId={project.id}
              currency={project.currency}
              payment={payment}
              onSave={onSave}
              onCancel={onClose}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;
