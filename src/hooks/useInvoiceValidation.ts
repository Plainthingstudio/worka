
import { useCallback } from 'react';
import { Invoice } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { getInvoiceType, isPartialInvoiceType } from '@/utils/invoiceTypes';

export function useInvoiceValidation() {
  const { toast } = useToast();

  const validateInvoice = useCallback((invoice: Invoice): boolean => {
    if (!invoice.clientId) {
      toast({
        title: "Missing client",
        description: "Please select a client for this invoice.",
        variant: "destructive"
      });
      return false;
    }

    const invoiceType = getInvoiceType(invoice);
    if (isPartialInvoiceType(invoiceType) && !invoice.projectId) {
      toast({
        title: "Missing project",
        description: "Please link this invoice to a project.",
        variant: "destructive"
      });
      return false;
    }

    if (isPartialInvoiceType(invoiceType) && Number(invoice.total) <= 0) {
      toast({
        title: "Invalid payment amount",
        description: "The invoice amount must be greater than zero.",
        variant: "destructive"
      });
      return false;
    }

    const availableBalance = Math.max(
      Number(invoice.projectTotalSnapshot || 0) - Number(invoice.alreadyPaidSnapshot || 0),
      0
    );
    if (isPartialInvoiceType(invoiceType) && availableBalance > 0 && Number(invoice.paymentAmount || 0) > availableBalance + 0.01) {
      toast({
        title: "Amount exceeds remaining balance",
        description: "The invoice payment cannot be greater than the remaining project balance.",
        variant: "destructive"
      });
      return false;
    }

    if (!Array.isArray(invoice.items) || invoice.items.some(item => !item.description || Number(item.quantity) <= 0)) {
      toast({
        title: "Invalid items",
        description: "Please ensure all items have a description and positive quantity.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [toast]);

  return { validateInvoice };
}
