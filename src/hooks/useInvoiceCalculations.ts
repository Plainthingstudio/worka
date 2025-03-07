
import { useEffect } from 'react';
import { Invoice } from '@/types';
import { calculateInvoiceTotals, formatCurrency } from '@/utils/invoiceCalculations';

export function useInvoiceCalculations(
  invoice: Invoice,
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>
) {
  // Calculate totals whenever relevant invoice fields change
  useEffect(() => {
    if (!invoice || !Array.isArray(invoice.items)) return;
    
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

    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      taxAmount,
      discountAmount,
      total
    }));
  }, [
    invoice?.items,
    invoice?.taxPercentage,
    invoice?.discountPercentage,
    setInvoice
  ]);

  return { formatCurrency };
}
