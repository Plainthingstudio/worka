
import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice } from "@/types";

interface InvoiceItemsTableProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  invoice,
  formatCurrency,
}) => {
  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Item</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Rate</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoice.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.description}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-center">${formatCurrency(item.rate)}</TableCell>
              <TableCell className="text-right">${formatCurrency(item.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Tax ({invoice.taxPercentage}%):</span>
            <span>${formatCurrency(invoice.taxAmount)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Discount ({invoice.discountPercentage}%):</span>
            <span>${formatCurrency(invoice.discountAmount)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>${formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItemsTable;
