
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Invoice, InvoiceItem } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { createNewInvoice } from '@/utils/invoiceCalculations';

// Helper function to validate invoice status
const validateInvoiceStatus = (status: string): "Draft" | "Sent" | "Paid" | "Overdue" => {
  const validStatuses = ["Draft", "Sent", "Paid", "Overdue"];
  if (validStatuses.includes(status)) {
    return status as "Draft" | "Sent" | "Paid" | "Overdue";
  }
  // Default to "Draft" if the status is not valid
  return "Draft";
};

export function useInvoiceData(invoiceId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(invoiceId);
  
  const [invoice, setInvoice] = useState<Invoice>(createNewInvoice());
  const [isLoading, setIsLoading] = useState(isEditing);
  
  // Fetch invoice data function
  const fetchInvoice = useCallback(async () => {
    if (!isEditing || !invoiceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to edit invoices.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Fetch the invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();
      
      if (invoiceError || !invoiceData) {
        throw new Error(invoiceError?.message || 'Invoice not found');
      }

      // Fetch the invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);
      
      if (itemsError) {
        throw new Error(itemsError.message);
      }

      console.log("Fetched invoice items from DB in useInvoiceData:", itemsData);
      
      // Transform to our Invoice type
      const processedItems: InvoiceItem[] = itemsData.map(item => ({
        id: item.id,
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0
      }));

      // Ensure that the status is one of the allowed values
      const validStatus = validateInvoiceStatus(invoiceData.status);

      const loadedInvoice: Invoice = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoice_number,
        clientId: invoiceData.client_id,
        date: new Date(invoiceData.date),
        dueDate: new Date(invoiceData.due_date),
        paymentTerms: invoiceData.payment_terms,
        items: processedItems,
        subtotal: invoiceData.subtotal,
        taxPercentage: invoiceData.tax_percentage || 0,
        taxAmount: invoiceData.tax_amount || 0,
        discountPercentage: invoiceData.discount_percentage || 0,
        discountAmount: invoiceData.discount_amount || 0,
        total: invoiceData.total,
        notes: invoiceData.notes || "",
        termsAndConditions: invoiceData.terms_and_conditions || "",
        createdAt: new Date(invoiceData.created_at),
        status: validStatus
      };

      console.log("Loaded invoice with items:", loadedInvoice);
      
      setInvoice(loadedInvoice);
      return { invoice: loadedInvoice, items: processedItems };
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice. Please try again.",
        variant: "destructive"
      });
      navigate('/invoices');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId, isEditing, navigate, toast]);

  // Automatically fetch invoice data on mount
  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  return {
    invoice,
    setInvoice,
    isLoading,
    isEditing,
    fetchInvoice
  };
}
