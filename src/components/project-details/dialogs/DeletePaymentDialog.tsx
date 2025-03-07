
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeletePaymentDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: DeletePaymentDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onConfirm}
            className="flex-1"
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePaymentDialog;
