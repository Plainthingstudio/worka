
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status when dialog opens
  React.useEffect(() => {
    if (open) {
      const checkAuth = async () => {
        const { data } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user);
      };
      checkAuth();
    }
  }, [open]);

  const handleConfirm = async () => {
    if (isDeleting) return; // Prevent multiple clicks
    
    // Double-check authentication
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setIsAuthenticated(false);
      return;
    }
    
    setIsDeleting(true);
    try {
      console.log("Delete dialog: Initiating confirmation");
      // Call the parent component's confirmation handler
      await onConfirm();
      
      // Dialog will be closed by the parent component on success
    } catch (error) {
      console.error("Error in DeleteBriefDialog:", error);
      // Keep dialog open on error so user can try again
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
            {isAuthenticated === false ? (
              <span className="text-red-500 font-medium">
                You must be logged in to delete briefs. Please log in and try again.
              </span>
            ) : (
              <>Are you sure you want to delete <strong>{briefName}</strong>? This action cannot be undone.</>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          {isAuthenticated !== false && (
            <Button variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBriefDialog;
