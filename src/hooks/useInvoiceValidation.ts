
import { useCallback } from 'react';
import { Invoice } from '@/types';
import { useToast } from '@/hooks/use-toast';

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
