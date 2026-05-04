
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types";
import { getInvoiceType, getPartialPaymentPrincipalLabel, isPartialInvoiceType } from "@/utils/invoiceTypes";

interface InvoiceSummaryProps {
  invoice: Invoice;
  formatCurrency: (amount: number) => string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  invoice,
  formatCurrency,
  handleInputChange,
}) => {
  const currency = invoice.currency || "IDR";
  const invoiceType = getInvoiceType(invoice);
  const isPartial = isPartialInvoiceType(invoiceType);
  const totalLabel = isPartial ? "Amount due today" : "Total";

  const money = (amount: number) => `${currency} ${formatCurrency(amount)}`;

  const taxDiscountRow = (
    <>
      <div className="text-right">
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Label className="text-muted-foreground" htmlFor="taxPercentage">
            Tax
          </Label>
          <Input
            id="taxPercentage"
            name="taxPercentage"
            type="number"
            min="0"
            className="h-8 w-14 text-right"
            value={invoice.taxPercentage}
            onChange={handleInputChange}
          />
          <span className="text-muted-foreground">%</span>
        </div>
      </div>
      <div className="text-right tabular-nums">{money(invoice.taxAmount)}</div>

      <div className="text-right">
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Label className="text-muted-foreground" htmlFor="discountPercentage">
            Discount
          </Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            min="0"
            className="h-8 w-14 text-right"
            value={invoice.discountPercentage}
            onChange={handleInputChange}
          />
          <span className="text-muted-foreground">%</span>
        </div>
      </div>
      <div className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
        {money(invoice.discountAmount)}
      </div>
    </>
  );

  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-lg font-medium">Totals</h3>
      <p className="text-xs text-muted-foreground">
        {isPartial
          ? "Subtotal, tax, and discount reflect full line items (total project scope). Amount due applies these rates to the payment portion (percentage or nominal)."
          : null}
      </p>
      <div className="ml-auto grid w-full max-w-md grid-cols-2 gap-x-4 gap-y-2">
        <div className="text-right text-muted-foreground">Subtotal</div>
        <div className="text-right tabular-nums">{money(invoice.subtotal)}</div>

        {taxDiscountRow}

        {isPartial ? (
          <>
            <div className="col-span-2 my-2 border-t border-dashed border-border" />
            <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Project summary
            </div>
            <div className="text-right text-muted-foreground">Project total</div>
            <div className="text-right tabular-nums font-medium">
              {money(invoice.projectTotalSnapshot || 0)}
            </div>
            {invoiceType !== "Down Payment" ? (
              <>
                <div className="text-right text-muted-foreground">Already paid</div>
                <div className="text-right tabular-nums">
                  {money(invoice.alreadyPaidSnapshot || 0)}
                </div>
              </>
            ) : null}
            <div className="text-right text-muted-foreground">
              {getPartialPaymentPrincipalLabel(invoice)}
            </div>
            <div className="text-right tabular-nums">{money(invoice.paymentAmount || 0)}</div>
            <div className="text-right text-muted-foreground">
              {invoiceType === "Down Payment"
                ? "Remaining after down payment"
                : "Remaining balance"}
            </div>
            <div className="text-right tabular-nums">
              {money(invoice.remainingAmountSnapshot || 0)}
            </div>
          </>
        ) : null}

        <div className="col-span-2 mt-1 border-t border-border pt-2" />
        <div className="text-right font-medium">{totalLabel}</div>
        <div className="text-right font-semibold tabular-nums">{money(invoice.total)}</div>
      </div>
    </div>
  );
};

export default InvoiceSummary;
