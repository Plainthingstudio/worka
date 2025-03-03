
import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import ClientForm from "@/components/ClientForm";
import { Client } from "@/types";

interface EditClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const EditClientDialog = ({ 
  isOpen, 
  onOpenChange, 
  client, 
  onSave, 
  onCancel 
}: EditClientDialogProps) => {
  if (!isOpen || !client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <ClientForm client={client} onSave={onSave} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
