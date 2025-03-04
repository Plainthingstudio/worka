
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types";

interface InvoiceSummaryProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ 
  invoice, 
  formatCurrency, 
  handleInputChange 
}) => {
  return (
    <div className="mt-6 grid gap-3">
      <div className="ml-auto grid w-64 grid-cols-2 gap-2">
        <div className="text-right">Subtotal:</div>
        <div className="text-right">${formatCurrency(invoice.subtotal)}</div>
        
        <div className="text-right">
          <div className="flex items-center justify-end">
            <Label className="mr-2" htmlFor="taxPercentage">Tax:</Label>
            <Input
              id="taxPercentage"
              name="taxPercentage"
              type="number"
              min="0"
              className="w-16 text-right"
              value={invoice.taxPercentage}
              onChange={handleInputChange}
            />
            <span className="ml-1">%</span>
          </div>
        </div>
        <div className="text-right">${formatCurrency(invoice.taxAmount)}</div>
        
        <div className="text-right">
          <div className="flex items-center justify-end">
            <Label className="mr-2" htmlFor="discountPercentage">Discount:</Label>
            <Input
              id="discountPercentage"
              name="discountPercentage"
              type="number"
              min="0"
              className="w-16 text-right"
              value={invoice.discountPercentage}
              onChange={handleInputChange}
            />
            <span className="ml-1">%</span>
          </div>
        </div>
        <div className="text-right">${formatCurrency(invoice.discountAmount)}</div>
        
        <div className="text-right font-medium">Total:</div>
        <div className="text-right font-medium">${formatCurrency(invoice.total)}</div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
