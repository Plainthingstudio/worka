
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

export function useInvoicePdf() {
  const { toast } = useToast();

  const generatePDF = useCallback(async (invoice: Invoice) => {
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we create your invoice PDF...",
      });
      
      await generateInvoicePDF(invoice);
      
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been created and downloaded.",
      });
      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
        
      toast({
        variant: "destructive",
        title: "PDF Generation Failed",
        description: errorMessage || "Failed to generate PDF. Please try again.",
      });
      return false;
    }
  }, [toast]);

  return { generatePDF };
}
