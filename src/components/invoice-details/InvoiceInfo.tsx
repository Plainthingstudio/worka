import React from "react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Invoice } from "@/types";
import { Client } from "@/types";
interface InvoiceInfoProps {
  invoice: Invoice;
  client: Client;
  formatCurrency: (amount: number) => string;
}
const InvoiceInfo: React.FC<InvoiceInfoProps> = ({
  invoice,
  client,
  formatCurrency
}) => {
  return <div className="">
      {/* Invoice Header */}
      <div className="border-b p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Invoice</h2>
            <div className="mt-2 text-sm">
              <p>Invoice Number: {invoice.invoiceNumber}</p>
              <p>Date: {format(new Date(invoice.date), "MMMM dd, yyyy")}</p>
              <p>Due Date: {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}</p>
              <p>Payment Terms: {invoice.paymentTerms}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end">
            <h3 className="font-medium">Billed To:</h3>
            <div className="mt-1 text-sm">
              <p className="font-medium">{client.name}</p>
              <p>{client.email}</p>
              <p>{client.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default InvoiceInfo;