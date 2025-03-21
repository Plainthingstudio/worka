
import React, { useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UIDesignBriefDetails from "./UIDesignBriefDetails";
import GraphicDesignBriefDetails from "./GraphicDesignBriefDetails";
import IllustrationBriefDetails from "./IllustrationBriefDetails";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [fullBriefDetails, setFullBriefDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch full brief details when the dialog opens
  useEffect(() => {
    const fetchFullBriefDetails = async () => {
      if (!open || !briefDetails) return;
      
      setIsLoading(true);
      console.log("Dialog opened with brief details:", briefDetails);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error("You must be logged in to view brief details");
          setIsLoading(false);
          return;
        }
        
        if (briefDetails.type === "Illustration Design" || briefDetails.type === "Illustrations") {
          const { data, error } = await supabase
            .from('illustration_design_briefs')
            .select('*')
            .eq('id', briefDetails.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching full illustration brief:", error);
            toast.error("Error loading illustration brief details");
            setFullBriefDetails(briefDetails);
          } else if (data) {
            console.log("Full illustration brief fetched:", data);
            setFullBriefDetails({
              ...data,
              type: "Illustration Design",
              submissionDate: data.submission_date,
              companyName: data.company_name
            });
          } else {
            console.warn("No illustration brief data found");
            setFullBriefDetails(briefDetails);
          }
        } else if (briefDetails.type === "UI Design") {
          const { data, error } = await supabase
            .from('ui_design_briefs')
            .select('*')
            .eq('id', briefDetails.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching full UI brief:", error);
            toast.error("Error loading UI design brief details");
            setFullBriefDetails(briefDetails);
          } else if (data) {
            console.log("Full UI brief fetched:", data);
            setFullBriefDetails({
              ...data,
              type: "UI Design",
              submissionDate: data.submission_date,
              companyName: data.company_name
            });
          } else {
            console.warn("No UI brief data found");
            setFullBriefDetails(briefDetails);
          }
        } else if (briefDetails.type === "Graphic Design") {
          const { data, error } = await supabase
            .from('graphic_design_briefs')
            .select('*')
            .eq('id', briefDetails.id)
            .maybeSingle();
          
          if (error) {
            console.error("Error fetching full graphic brief:", error);
            toast.error("Error loading graphic design brief details");
            setFullBriefDetails(briefDetails);
          } else if (data) {
            console.log("Full graphic brief fetched:", data);
            setFullBriefDetails({
              ...data,
              type: "Graphic Design",
              submissionDate: data.submission_date,
              companyName: data.company_name
            });
          } else {
            console.warn("No graphic brief data found");
            setFullBriefDetails(briefDetails);
          }
        } else {
          console.warn("Unknown brief type:", briefDetails.type);
          setFullBriefDetails(briefDetails);
        }
      } catch (error) {
        console.error("Error fetching full brief details:", error);
        toast.error("Error loading brief details");
        setFullBriefDetails(briefDetails);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFullBriefDetails();
  }, [open, briefDetails]);

  // If no brief details are available, don't render anything
  if (!briefDetails) return null;

  // Enhanced logging for debugging
  console.log("Brief details in dialog:", fullBriefDetails || briefDetails);

  // Safely format date function
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "Not available";
    
    try {
      // If it's a string, try to parse it
      const dateObj = typeof dateValue === 'string' 
        ? parseISO(dateValue) 
        : new Date(dateValue);
      
      // Check if date is valid before formatting
      if (isValid(dateObj)) {
        return format(dateObj, "MMMM d, yyyy");
      }
      return "Invalid date";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date format error";
    }
  };

  // Helper function to get value that might be in camelCase or snake_case
  const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not available") => {
    const details = fullBriefDetails || briefDetails;
    const value = details[camelCaseKey] !== undefined 
      ? details[camelCaseKey] 
      : details[snakeCaseKey] !== undefined 
        ? details[snakeCaseKey] 
        : defaultValue;
    return value || defaultValue; // Return defaultValue if value is null/undefined
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Brief Details</DialogTitle>
          <DialogDescription>
            View detailed information about the client brief
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading brief details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Client Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {getValue("name", "name", "Not available")}</p>
                  <p><span className="font-medium">Email:</span> {getValue("email", "email", "Not available")}</p>
                  <p>
                    <span className="font-medium">Company:</span> {
                      getValue("companyName", "company_name")
                    }
                  </p>
                  {(fullBriefDetails?.phone || briefDetails?.phone) && (
                    <p><span className="font-medium">Phone:</span> {getValue("phone", "phone", "Not available")}</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Brief Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Type:</span> {getValue("type", "type", "Not available")}</p>
                  <p><span className="font-medium">Status:</span> {getValue("status", "status", "Not available")}</p>
                  <p>
                    <span className="font-medium">Submitted:</span>{" "}
                    {formatDate(getValue("submissionDate", "submission_date"))}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Project Details</h3>
              
              {(getValue("type", "type") === "Illustration Design" || getValue("type", "type") === "Illustrations") ? (
                <IllustrationBriefDetails briefDetails={fullBriefDetails || briefDetails} />
              ) : getValue("type", "type") === "Graphic Design" ? (
                <GraphicDesignBriefDetails briefDetails={fullBriefDetails || briefDetails} />
              ) : getValue("type", "type") === "UI Design" ? (
                <UIDesignBriefDetails briefDetails={fullBriefDetails || briefDetails} />
              ) : (
                <p>No details available for this brief type.</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => onDownload(fullBriefDetails || briefDetails)}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BriefDetailsDialog;
