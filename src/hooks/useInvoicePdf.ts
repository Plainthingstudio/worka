
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

export function useInvoicePdf() {
  const { toast } = useToast();

  const generatePDF = useCallback(async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been created and downloaded.",
      });
      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
      return false;
    }
  }, [toast]);

  return { generatePDF };
}
