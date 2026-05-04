
import React from "react";
import { Eye, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InvoiceActionsProps {
  onSubmit: () => void | Promise<void>;
  onGeneratePDF: () => void | Promise<void>;
  isPersisting?: boolean;
}

const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  onSubmit,
  onGeneratePDF,
  isPersisting = false,
}) => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    void onSubmit();
  };

  const handleGeneratePDF = () => {
    void onGeneratePDF();
  };

  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        disabled={isPersisting}
        onClick={() => navigate("/invoices")}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isPersisting}
        onClick={handleGeneratePDF}
      >
        {isPersisting ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <Eye className="mr-1 h-4 w-4" />
        )}
        Preview
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isPersisting}
        onClick={handleSubmit}
      >
        {isPersisting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
        Save Invoice
      </Button>
      <Button type="button" disabled={isPersisting} onClick={handleGeneratePDF}>
        {isPersisting ? (
          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
        ) : (
          <FileText className="mr-1 h-4 w-4" />
        )}
        Generate PDF
      </Button>
    </div>
  );
};

export default InvoiceActions;
