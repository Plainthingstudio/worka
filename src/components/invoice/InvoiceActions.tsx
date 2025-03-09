
import React from "react";
import { Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface InvoiceActionsProps {
  isEditing?: boolean; // Keep for type compatibility but won't be used
  onSubmit: () => void;
  onGeneratePDF: () => void;
  invoice: Invoice;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ 
  onSubmit, 
  onGeneratePDF,
  invoice
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = () => {
    console.log("Submitting invoice...");
    onSubmit();
  };
  
  const handleGeneratePDF = () => {
    try {
      // Just call the provided onGeneratePDF function which already handles everything
      onGeneratePDF();
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate("/invoices")}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleGeneratePDF}
      >
        <Eye className="mr-1 h-4 w-4" />
        Preview
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={handleGeneratePDF}
      >
        <FileText className="mr-1 h-4 w-4" />
        Generate PDF
      </Button>
      <Button
        type="button"
        onClick={handleSubmit}
      >
        Save Invoice
      </Button>
    </div>
  );
};

export default InvoiceActions;
