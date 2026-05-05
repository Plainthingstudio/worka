
import { useCallback } from 'react';
import { Invoice } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getInvoiceType, isPartialInvoiceType } from '@/utils/invoiceTypes';

export type ValidateInvoiceOptions = {
  /** If true, do not show toasts (for background autosave). */
  silent?: boolean;
};

export function useInvoiceValidation() {
  const { toast } = useToast();

  const validateInvoice = useCallback(
    (invoice: Invoice, options?: ValidateInvoiceOptions): boolean => {
      const silent = options?.silent === true;
      const notify = (title: string, description: string) => {
        if (!silent) {
          toast({ title, description, variant: "destructive" });
        }
      };

      if (!invoice.clientId) {
        notify("Missing client", "Please select a client for this invoice.");
        return false;
      }

      const invoiceType = getInvoiceType(invoice);
      if (isPartialInvoiceType(invoiceType) && !invoice.projectId) {
        notify("Missing project", "Please link this invoice to a project.");
        return false;
      }

      if (isPartialInvoiceType(invoiceType) && Number(invoice.total) <= 0) {
        notify("Invalid payment amount", "The invoice amount must be greater than zero.");
        return false;
      }

      const availableBalance = Math.max(
        Number(invoice.projectTotalSnapshot || 0) - Number(invoice.alreadyPaidSnapshot || 0),
        0
      );
      if (
        isPartialInvoiceType(invoiceType) &&
        availableBalance > 0 &&
        Number(invoice.paymentAmount || 0) > availableBalance + 0.01
      ) {
        notify(
          "Amount exceeds remaining balance",
          "The invoice payment cannot be greater than the remaining project balance."
        );
        return false;
      }

      if (
        !Array.isArray(invoice.items) ||
        invoice.items.some((item) => !item.description || Number(item.quantity) <= 0)
      ) {
        notify(
          "Invalid items",
          "Please ensure all items have a description and positive quantity."
        );
        return false;
      }

      return true;
    },
    [toast]
  );

  return { validateInvoice };
}
