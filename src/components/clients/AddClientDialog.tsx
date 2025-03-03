
import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ClientForm from "@/components/ClientForm";

interface AddClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AddClientDialog = ({ isOpen, onOpenChange, onSave, onCancel }: AddClientDialogProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <ClientForm onSave={onSave} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
