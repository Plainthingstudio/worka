
import React from "react";
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
import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@/types";

interface ChangeStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
}

const ChangeStatusDialog = ({
  isOpen,
  onClose,
  onSave,
  selectedStatus,
  onStatusChange,
}: ChangeStatusDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeStatusDialog;
