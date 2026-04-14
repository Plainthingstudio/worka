
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { account, databases, DATABASE_ID, ID, Query } from '@/integrations/appwrite/client';
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
      let session;
      try {
        session = await account.getSession('current');
      } catch {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save invoices.",
          variant: "destructive"
        });
        return false;
      }

      if (!session) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save invoices.",
          variant: "destructive"
        });
        return false;
      }

      // Format invoice for database insert/update
      const invoiceData: any = {
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
        user_id: session.userId
      };

      // Save invoice
      if (isEditing) {
        await databases.updateDocument(DATABASE_ID, 'invoices', invoice.id, invoiceData);
      } else {
        await databases.createDocument(DATABASE_ID, 'invoices', invoice.id || ID.unique(), invoiceData);
      }

      // Handle invoice items
      if (isEditing) {
        // Delete existing items for this invoice
        const existingItemsResponse = await databases.listDocuments(
          DATABASE_ID,
          'invoice_items',
          [Query.equal('invoice_id', invoice.id)]
        );
        await Promise.all(
          existingItemsResponse.documents.map((item: any) =>
            databases.deleteDocument(DATABASE_ID, 'invoice_items', item.$id)
          )
        );
      }

      // Insert new items
      await Promise.all(
        invoice.items.map(item =>
          databases.createDocument(DATABASE_ID, 'invoice_items', item.id || ID.unique(), {
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
            user_id: session.userId
          })
        )
      );

      toast({
        title: isEditing ? "Invoice Updated" : "Invoice Created",
        description: isEditing ? "Invoice has been updated successfully." : "Invoice has been created successfully."
      });

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
      try {
        await account.getSession('current');
      } catch {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to delete invoices.",
          variant: "destructive"
        });
        return;
      }

      // First delete related invoice items
      const existingItemsResponse = await databases.listDocuments(
        DATABASE_ID,
        'invoice_items',
        [Query.equal('invoice_id', invoiceId)]
      );
      await Promise.all(
        existingItemsResponse.documents.map((item: any) =>
          databases.deleteDocument(DATABASE_ID, 'invoice_items', item.$id)
        )
      );

      // Then delete the invoice
      await databases.deleteDocument(DATABASE_ID, 'invoices', invoiceId);

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
