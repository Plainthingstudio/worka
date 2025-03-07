
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

export function useInvoicePdf() {
  const { toast } = useToast();

  const generatePDF = useCallback((invoice: Invoice) => {
    try {
      generateInvoicePDF(invoice);
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been created and downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  }, [toast]);

  return { generatePDF };
}
