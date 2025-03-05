import React, { useEffect } from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UIDesignBriefDetails from "./UIDesignBriefDetails";
import GraphicDesignBriefDetails from "./GraphicDesignBriefDetails";
import IllustrationBriefDetails from "./IllustrationBriefDetails";

interface BriefDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  briefDetails: any | null;
  onDownload: (brief: any) => void;
}

const BriefDetailsDialog: React.FC<BriefDetailsDialogProps> = ({
  open,
  onOpenChange,
  briefDetails,
  onDownload,
}) => {
  if (!briefDetails) return null;

  // Enhanced logging for debugging
  console.log("Brief details in dialog:", briefDetails);
  console.log("Brief type:", briefDetails.type);
  console.log("Logo feelings:", briefDetails.logoFeelings);
  
  if (briefDetails.logoFeelings) {
    console.log("Logo feelings complexity:", briefDetails.logoFeelings.complexity);
    console.log("Logo feelings gender:", briefDetails.logoFeelings.gender);
    console.log("Logo feelings pricing:", briefDetails.logoFeelings.pricing);
    console.log("Logo feelings era:", briefDetails.logoFeelings.era);
    console.log("Logo feelings tone:", briefDetails.logoFeelings.tone);
  }
  
  console.log("Services data:", briefDetails.services);
  console.log("Print Media data:", briefDetails.printMedia);
  console.log("Digital Media data:", briefDetails.digitalMedia);
  
  // Add effect to log when the dialog opens/closes
  useEffect(() => {
    if (open && briefDetails) {
      console.log("Dialog opened with brief details:", briefDetails);
      console.log("Logo feelings in dialog open effect:", briefDetails.logoFeelings);
    }
  }, [open, briefDetails]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brief Details</DialogTitle>
          <DialogDescription>
            View detailed information about the client brief
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Client Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {briefDetails.name}</p>
                <p><span className="font-medium">Email:</span> {briefDetails.email}</p>
                <p><span className="font-medium">Company:</span> {briefDetails.companyName}</p>
                {briefDetails.phone && <p><span className="font-medium">Phone:</span> {briefDetails.phone}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Brief Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Type:</span> {briefDetails.type}</p>
                <p><span className="font-medium">Status:</span> {briefDetails.status}</p>
                <p>
                  <span className="font-medium">Submitted:</span>{" "}
                  {format(new Date(briefDetails.submissionDate), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Project Details</h3>
            
            {briefDetails.type === "Illustration Design" || briefDetails.type === "Illustrations" ? (
              <IllustrationBriefDetails briefDetails={briefDetails} />
            ) : briefDetails.type === "Graphic Design" ? (
              <GraphicDesignBriefDetails briefDetails={briefDetails} />
            ) : briefDetails.type === "UI Design" ? (
              <UIDesignBriefDetails briefDetails={briefDetails} />
            ) : (
              <p>No details available for this brief type.</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => {
              console.log("Download button clicked with brief:", briefDetails);
              console.log("Logo feelings at download time:", briefDetails.logoFeelings);
              onDownload(briefDetails);
            }}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BriefDetailsDialog;
