
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Invoice } from "@/types";

interface InvoiceNotesProps {
  invoice: Invoice;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InvoiceNotes: React.FC<InvoiceNotesProps> = ({ invoice, handleInputChange }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={invoice.notes}
          onChange={handleInputChange}
          className="mt-1 min-h-[100px]"
          placeholder="Additional notes for the client"
        />
      </div>
      
      <div>
        <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
        <Textarea
          id="termsAndConditions"
          name="termsAndConditions"
          value={invoice.termsAndConditions}
          onChange={handleInputChange}
          className="mt-1 min-h-[100px]"
          placeholder="Payment terms and conditions"
        />
      </div>
    </div>
  );
};

export default InvoiceNotes;
