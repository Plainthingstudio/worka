
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
import { getInvoiceType, getPartialPaymentPrincipalLabel, isPartialInvoiceType } from "@/utils/invoiceTypes";

interface InvoiceItemsTableProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
}

const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  invoice,
  formatCurrency,
}) => {
  const invoiceType = getInvoiceType(invoice);
  const isPartialInvoice = isPartialInvoiceType(invoiceType);
  const currency = invoice.currency || "IDR";

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
              <TableCell className="text-center">
                {currency} {formatCurrency(item.rate)}
              </TableCell>
              <TableCell className="text-right">
                {currency} {formatCurrency(item.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex justify-end">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>
              {currency} {formatCurrency(invoice.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax ({invoice.taxPercentage}%)</span>
            <span>
              {currency} {formatCurrency(invoice.taxAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Discount ({invoice.discountPercentage}%)</span>
            <span>
              {currency} {formatCurrency(invoice.discountAmount)}
            </span>
          </div>

          {isPartialInvoice ? (
            <>
              <Separator className="my-2" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Project summary
              </p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project total</span>
                <span>{currency} {formatCurrency(invoice.projectTotalSnapshot || 0)}</span>
              </div>

              {invoiceType !== "Down Payment" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Already paid</span>
                  <span>{currency} {formatCurrency(invoice.alreadyPaidSnapshot || 0)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">{getPartialPaymentPrincipalLabel(invoice)}</span>
                <span>{currency} {formatCurrency(invoice.paymentAmount || 0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {invoiceType === "Down Payment" ? "Remaining after down payment" : "Remaining balance"}
                </span>
                <span>{currency} {formatCurrency(invoice.remainingAmountSnapshot || 0)}</span>
              </div>
            </>
          ) : null}

          <Separator />

          <div className="flex justify-between font-medium">
            <span>{isPartialInvoice ? "Amount due today" : "Total"}</span>
            <span>
              {currency} {formatCurrency(invoice.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceItemsTable;
