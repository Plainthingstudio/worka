
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteBriefDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  briefName?: string;
}

const DeleteBriefDialog: React.FC<DeleteBriefDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  briefName = "this brief",
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      // Close the dialog first to prevent UI freezing
      onOpenChange(false);
      
      // Then perform the deletion operation
      await onConfirm();
      
      // No need for success toast here as it will be shown in the deleteBrief function
    } catch (error) {
      console.error("Error deleting brief:", error);
      // No need for error toast here as it will be shown in the deleteBrief function
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newState) => {
      // Prevent closing the dialog while deleting is in progress
      if (isDeleting && !newState) return;
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Brief</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{briefName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBriefDialog;
