
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Invoice, InvoiceItem } from '@/types';
import { account, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { createNewInvoice } from '@/utils/invoiceCalculations';
import { invoiceTypeFromDocument } from '@/utils/invoiceTypes';

// Helper function to validate invoice status
const validateInvoiceStatus = (status: string): "Draft" | "Sent" | "Paid" | "Overdue" => {
  const validStatuses = ["Draft", "Sent", "Paid", "Overdue"];
  if (validStatuses.includes(status)) {
    return status as "Draft" | "Sent" | "Paid" | "Overdue";
  }
  return "Draft";
};

export function useInvoiceData(invoiceId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(invoiceId);

  const [invoice, setInvoice] = useState<Invoice>(createNewInvoice());
  const [isLoading, setIsLoading] = useState(isEditing);

  const fetchInvoice = useCallback(async () => {
    if (!isEditing || !invoiceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Check if user is authenticated
      try {
        await account.getSession('current');
      } catch {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to edit invoices.",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }

      // Fetch the invoice
      let invoiceData: any = null;
      try {
        invoiceData = await databases.getDocument(DATABASE_ID, 'invoices', invoiceId);
      } catch {
        throw new Error('Invoice not found');
      }

      if (!invoiceData) {
        throw new Error('Invoice not found');
      }

      // Fetch the invoice items
      const itemsResponse = await databases.listDocuments(
        DATABASE_ID,
        'invoice_items',
        [Query.equal('invoice_id', invoiceId)]
      );
      const itemsData = itemsResponse.documents;

      // Fetch client data
      let clientName = "Unknown Client";
      try {
        const clientDoc = await databases.getDocument(DATABASE_ID, 'clients', invoiceData.client_id);
        clientName = clientDoc?.name || "Unknown Client";
      } catch (clientError) {
        console.error("Error fetching client:", clientError);
      }

      console.log("Fetched invoice items from DB in useInvoiceData:", itemsData);

      // Transform to our Invoice type
      const processedItems: InvoiceItem[] = itemsData.map((item: any) => ({
        id: item.$id,
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.amount) || 0
      }));

      const validStatus = validateInvoiceStatus(invoiceData.status);
      const invoiceType = invoiceTypeFromDocument(invoiceData);

      const loadedInvoice: Invoice = {
        id: invoiceData.$id,
        invoiceNumber: invoiceData.invoice_number,
        clientId: invoiceData.client_id,
        clientName: clientName,
        projectId: invoiceData.project_id || "",
        currency: invoiceData.currency || "IDR",
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
        createdAt: new Date(invoiceData.$createdAt),
        status: validStatus,
        invoiceType,
        paymentType: invoiceType,
        paymentMode: invoiceData.payment_mode || "percentage",
        paymentPercentage: invoiceData.payment_percentage ?? (invoiceType === "Milestone Payment" ? 25 : 50),
        paymentAmount: invoiceData.payment_amount || invoiceData.total || 0,
        projectTotalSnapshot: invoiceData.project_total_snapshot || 0,
        alreadyPaidSnapshot: invoiceData.already_paid_snapshot || 0,
        remainingAmountSnapshot: invoiceData.remaining_amount_snapshot || 0
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
