
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useInvoiceCrud = (
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  fetchInvoices: () => Promise<void>
) => {
  const { toast } = useToast();

  const saveInvoice = async (invoice: Invoice, isEditing: boolean): Promise<boolean> => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save invoices.",
          variant: "destructive"
        });
        return false;
      }

      // Format invoice for database insert/update
      const invoiceData = {
        id: invoice.id,
        invoice_number: invoice.invoiceNumber,
        client_id: invoice.clientId,
        date: invoice.date instanceof Date ? invoice.date.toISOString() : invoice.date,
        due_date: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate,
        payment_terms: invoice.paymentTerms,
        subtotal: invoice.subtotal,
        tax_percentage: invoice.taxPercentage,
        tax_amount: invoice.taxAmount,
        discount_percentage: invoice.discountPercentage,
        discount_amount: invoice.discountAmount,
        total: invoice.total,
        notes: invoice.notes,
        terms_and_conditions: invoice.termsAndConditions,
        status: invoice.status,
        user_id: session.user.id
      };

      // Save invoice
      let invoiceResult;
      if (isEditing) {
        invoiceResult = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id);
      } else {
        invoiceResult = await supabase
          .from('invoices')
          .insert(invoiceData);
      }

      if (invoiceResult.error) {
        throw invoiceResult.error;
      }

      // Handle invoice items
      if (isEditing) {
        // Delete existing items for this invoice
        const { error: deleteError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id);
        
        if (deleteError) {
          throw deleteError;
        }
      }

      // Insert new items
      const itemsToInsert = invoice.items.map(item => ({
        id: item.id || uuidv4(),
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        user_id: session.user.id
      }));

      const { error: insertError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert);
      
      if (insertError) {
        throw insertError;
      }

      toast({
        title: isEditing ? "Invoice Updated" : "Invoice Created",
        description: isEditing ? "Invoice has been updated successfully." : "Invoice has been created successfully."
      });

      // Refresh the invoices list
      fetchInvoices();
      return true;
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteInvoice = async (invoiceId: string | null) => {
    if (!invoiceId) return;

    try {
      setIsLoading(true);
      
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete invoices.",
          variant: "destructive"
        });
        return;
      }
      
      // First delete related invoice items
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // Then delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);
      
      if (invoiceError) {
        throw invoiceError;
      }
      
      // Update local state
      setInvoices(prev => prev.filter(i => i.id !== invoiceId));
      
      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted."
      });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveInvoice,
    deleteInvoice
  };
};
