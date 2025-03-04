
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Download, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/types";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit Invoice
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleGeneratePDF}
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
