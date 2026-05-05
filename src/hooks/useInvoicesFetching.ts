
import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { account, databases, DATABASE_ID, Query } from '@/integrations/appwrite/client';
import { Invoice } from '@/types';
import { invoiceTypeFromDocument } from '@/utils/invoiceTypes';

export const useInvoicesFetching = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get current user session
      try {
        await account.getSession('current');
      } catch {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to view invoices.",
          variant: "destructive"
        });
        return;
      }

      // Fetch invoices
      const invoicesResponse = await databases.listDocuments(
        DATABASE_ID,
        'invoices',
        [Query.orderDesc('$createdAt')]
      );
      const invoicesData = invoicesResponse.documents;

      // Fetch all invoice items
      const invoiceItemsResponse = await databases.listDocuments(DATABASE_ID, 'invoice_items');
      const invoiceItemsData = invoiceItemsResponse.documents;

      // Fetch clients data
      const clientsResponse = await databases.listDocuments(DATABASE_ID, 'clients');
      const clientsData = clientsResponse.documents;

      const projectsResponse = await databases.listDocuments(DATABASE_ID, 'projects');
      const projectsData = projectsResponse.documents;

      console.log("Fetched invoice items from DB:", invoiceItemsData);
      console.log("Fetched clients from DB:", clientsData);

      const validateStatus = (status: string): "Draft" | "Sent" | "Paid" | "Overdue" => {
        const validStatuses = ["Draft", "Sent", "Paid", "Overdue"];
        if (validStatuses.includes(status)) {
          return status as "Draft" | "Sent" | "Paid" | "Overdue";
        }
        return "Draft";
      };

      const transformedInvoices: Invoice[] = invoicesData.map((invoice: any) => {
        // Find items for this invoice
        const items = invoiceItemsData
          .filter((item: any) => item.invoice_id === invoice.$id)
          .map((item: any) => ({
            id: item.$id,
            description: item.description || "",
            quantity: Number(item.quantity) || 1,
            rate: Number(item.rate) || 0,
            amount: Number(item.amount) || 0
          }));

        // Find client name
        const client = clientsData.find((c: any) => c.$id === invoice.client_id);
        const clientName = client ? client.name : "Unknown Client";

        const project = invoice.project_id
          ? projectsData.find((p: any) => p.$id === invoice.project_id)
          : undefined;
        const projectName = project?.name ?? "";

        const invoiceType = invoiceTypeFromDocument(invoice);

        return {
          id: invoice.$id,
          invoiceNumber: invoice.invoice_number,
          clientId: invoice.client_id,
          clientName: clientName,
          projectId: invoice.project_id || "",
          projectName,
          currency: invoice.currency || "IDR",
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
          createdAt: new Date(invoice.$createdAt),
          status: validateStatus(invoice.status),
          invoiceType,
          paymentType: invoiceType,
          paymentMode: invoice.payment_mode || "percentage",
          paymentPercentage: invoice.payment_percentage ?? (invoiceType === "Milestone Payment" ? 25 : 50),
          paymentAmount: invoice.payment_amount || invoice.total || 0,
          projectTotalSnapshot: invoice.project_total_snapshot || 0,
          alreadyPaidSnapshot: invoice.already_paid_snapshot || 0,
          remainingAmountSnapshot: invoice.remaining_amount_snapshot || 0
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
