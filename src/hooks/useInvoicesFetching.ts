
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types';

export const useInvoicesFetching = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to view invoices.",
          variant: "destructive"
        });
        return;
      }
      
      // Fetch invoices from Supabase
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (invoicesError) {
        throw invoicesError;
      }
      
      // Fetch all invoice items
      const { data: invoiceItemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*');
      
      if (itemsError) {
        throw itemsError;
      }

      console.log("Fetched invoice items from DB:", invoiceItemsData);

      // Helper function to validate status
      const validateStatus = (status: string): "Draft" | "Sent" | "Paid" | "Overdue" => {
        const validStatuses = ["Draft", "Sent", "Paid", "Overdue"];
        if (validStatuses.includes(status)) {
          return status as "Draft" | "Sent" | "Paid" | "Overdue";
        }
        return "Draft"; // Default fallback
      };

      // Transform the data to match our expected format
      const transformedInvoices: Invoice[] = invoicesData.map(invoice => {
        // Find items for this invoice
        const items = invoiceItemsData
          .filter(item => item.invoice_id === invoice.id)
          .map(item => ({
            id: item.id,
            description: item.description || "",
            quantity: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0
          }));

        console.log(`Items for invoice ${invoice.id}:`, items);

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          clientId: invoice.client_id,
          date: new Date(invoice.date),
          dueDate: new Date(invoice.due_date),
          paymentTerms: invoice.payment_terms,
          items: items,
          subtotal: invoice.subtotal,
          taxPercentage: invoice.tax_percentage || 0,
          taxAmount: invoice.tax_amount || 0,
          discountPercentage: invoice.discount_percentage || 0,
          discountAmount: invoice.discount_amount || 0,
          total: invoice.total,
          notes: invoice.notes || "",
          termsAndConditions: invoice.terms_and_conditions || "",
          createdAt: new Date(invoice.created_at),
          status: validateStatus(invoice.status)
        };
      });

      setInvoices(transformedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    invoices,
    setInvoices,
    isLoading,
    setIsLoading,
    fetchInvoices
  };
};
