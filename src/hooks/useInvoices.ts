
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceItem } from '@/types';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { v4 as uuidv4 } from 'uuid';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

      // Transform the data to match our expected format
      const transformedInvoices: Invoice[] = invoicesData.map(invoice => {
        // Find items for this invoice
        const items = invoiceItemsData
          .filter(item => item.invoice_id === invoice.id)
          .map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
          }));

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
          status: invoice.status
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

  const deleteInvoice = async () => {
    if (!invoiceToDelete) return;

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
        .eq('invoice_id', invoiceToDelete);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // Then delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete);
      
      if (invoiceError) {
        throw invoiceError;
      }
      
      // Update local state
      setInvoices(prev => prev.filter(i => i.id !== invoiceToDelete));
      
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
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
      setIsLoading(false);
    }
  };

  const confirmDelete = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteConfirmOpen(true);
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      await generateInvoicePDF(invoice);
      toast({
        title: "PDF Generated",
        description: "The invoice PDF has been successfully generated."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}/edit`);
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    isLoading,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    invoiceToDelete,
    fetchInvoices,
    saveInvoice,
    deleteInvoice,
    confirmDelete,
    handleDownload,
    handleViewInvoice,
    handleEditInvoice
  };
};
