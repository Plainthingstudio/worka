
import React from "react";
import { Invoice } from "@/types";

interface InvoiceNotesTermProps {
  invoice: Invoice;
}

const InvoiceNotesTerm: React.FC<InvoiceNotesTermProps> = ({ invoice }) => {
  // Don't render if there are no notes or terms
  if (!invoice.notes && !invoice.termsAndConditions) {
    return null;
  }
  
  return (
    <div className="border-t p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {invoice.notes && (
          <div>
            <h3 className="mb-2 font-medium">Notes</h3>
            <p className="text-sm text-muted-foreground">{invoice.notes}</p>
          </div>
        )}
        
        {invoice.termsAndConditions && (
          <div>
            <h3 className="mb-2 font-medium">Terms and Conditions</h3>
            <p className="text-sm text-muted-foreground">{invoice.termsAndConditions}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceNotesTerm;
