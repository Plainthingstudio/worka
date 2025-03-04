
import React from "react";
import { Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { Invoice } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface InvoiceActionsProps {
  isEditing: boolean;
  onSubmit: () => void;
  onGeneratePDF: () => void;
  invoice: Invoice;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ 
  isEditing, 
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
  
  const handleGeneratePDF = async () => {
    try {
      // Call our actual PDF generation function
      await generateInvoicePDF(invoice);
      
      // Also call the original onGeneratePDF for any additional logic
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
        {isEditing ? "Update Invoice" : "Save Invoice"}
      </Button>
    </div>
  );
};

export default InvoiceActions;
