
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/types";

interface InvoiceDetailsHeaderProps {
  invoice: Invoice;
  onDeleteClick: () => void;
  onGeneratePDF: () => void;
}

const InvoiceDetailsHeader: React.FC<InvoiceDetailsHeaderProps> = ({
  invoice,
  onDeleteClick,
  onGeneratePDF,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-6">
        <Link to="/invoices" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Invoice #{invoice.invoiceNumber}
        </h1>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteClick}
          >
            <Trash className="mr-1 h-4 w-4" />
            Delete
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onGeneratePDF}
          >
            <Download className="mr-1 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetailsHeader;
