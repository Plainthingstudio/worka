
import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InvoiceActionsProps {
  isEditing: boolean;
  onSubmit: () => void;
  onGeneratePDF: () => void;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({ 
  isEditing, 
  onSubmit, 
  onGeneratePDF 
}) => {
  const navigate = useNavigate();
  
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
        onClick={onGeneratePDF}
      >
        <Eye className="mr-1 h-4 w-4" />
        Preview
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onGeneratePDF}
      >
        Generate PDF
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
      >
        {isEditing ? "Update Invoice" : "Save Invoice"}
      </Button>
    </div>
  );
};

export default InvoiceActions;
