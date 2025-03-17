
import { useEffect } from 'react';
import { Invoice } from '@/types';
import { calculateInvoiceTotals, formatCurrency as formatCurrencyUtil } from '@/utils/invoiceCalculations';

export function useInvoiceCalculations(
  invoice: Invoice,
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>
) {
  // Calculate totals whenever relevant invoice fields change
  useEffect(() => {
    if (!invoice || !Array.isArray(invoice.items) || invoice.items.length === 0) {
      console.log("useInvoiceCalculations: Invoice or items invalid, skipping calculation");
      return;
    }
    
    console.log("useInvoiceCalculations: Calculating totals for invoice", invoice.id);
    
    const { 
      subtotal, 
      taxAmount, 
      discountAmount, 
      total, 
      updatedItems 
    } = calculateInvoiceTotals(
      invoice.items, 
      invoice.taxPercentage, 
      invoice.discountPercentage
    );

    // Only update if values actually changed
    if (
      subtotal !== invoice.subtotal ||
      taxAmount !== invoice.taxAmount ||
      discountAmount !== invoice.discountAmount ||
      total !== invoice.total
    ) {
      console.log("useInvoiceCalculations: Updating invoice with new totals", {
        subtotal, taxAmount, discountAmount, total
      });
      
      setInvoice(prev => ({
        ...prev,
        items: updatedItems,
        subtotal,
        taxAmount,
        discountAmount,
        total
      }));
    }
  }, [
    invoice?.id,
    invoice?.items,
    invoice?.taxPercentage,
    invoice?.discountPercentage,
    invoice?.subtotal,
    invoice?.taxAmount,
    invoice?.discountAmount,
    invoice?.total,
    setInvoice
  ]);

  return { formatCurrency: formatCurrencyUtil };
}
