import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Client, Invoice } from "@/types";
import { account, databases, DATABASE_ID, Query } from "@/integrations/appwrite/client";
import { useClients } from "@/hooks/useClients";
import { useInvoicePdf } from "@/hooks/useInvoicePdf";
import { invoiceTypeFromDocument } from "@/utils/invoiceTypes";

// Import refactored components
import InvoiceDetailsHeader from "@/components/invoice-details/InvoiceDetailsHeader";
import InvoiceInfo from "@/components/invoice-details/InvoiceInfo";
import InvoiceItemsTable from "@/components/invoice-details/InvoiceItemsTable";
import InvoiceNotesTerm from "@/components/invoice-details/InvoiceNotesTerm";
import DeleteInvoiceDialog from "@/components/invoice-details/DeleteInvoiceDialog";
import InvoiceLoading from "@/components/invoice-details/InvoiceLoading";

type InvoiceDocument = {
  $id: string;
  $createdAt: string;
  invoice_number: string;
  client_id: string;
  project_id?: string;
  currency?: "USD" | "IDR";
  date: string;
  due_date: string;
  payment_terms: string;
  subtotal: number;
  tax_percentage?: number;
  tax_amount?: number;
  discount_percentage?: number;
  discount_amount?: number;
  total: number;
  notes?: string;
  terms_and_conditions?: string;
  status: string;
  payment_type?: string;
  invoice_type?: string;
  payment_mode?: "percentage" | "nominal";
  payment_percentage?: number;
  payment_amount?: number;
  project_total_snapshot?: number;
  already_paid_snapshot?: number;
  remaining_amount_snapshot?: number;
};

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients, isLoading: isClientsLoading } = useClients();
  const { generatePDF } = useInvoicePdf();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to validate invoice status
  const validateInvoiceStatus = (status: string): "Draft" | "Sent" | "Paid" | "Overdue" => {
    const validStatuses = ["Draft", "Sent", "Paid", "Overdue"];
    if (validStatuses.includes(status)) {
      return status as "Draft" | "Sent" | "Paid" | "Overdue";
    }
    return "Draft"; // Default fallback
  };

  // Fetch invoice and related data
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceId) return;

      try {
        setIsLoading(true);

        // Check if user is authenticated
        try {
          await account.getSession('current');
        } catch {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to view invoice details.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }

        // Fetch the invoice
        let invoiceData: InvoiceDocument | null = null;
        try {
          const response = await databases.listDocuments(DATABASE_ID, 'invoices', [
            Query.equal('$id', invoiceId)
          ]);
          invoiceData = (response.documents[0] as unknown as InvoiceDocument) ?? null;
        } catch (invoiceError: unknown) {
          const message = invoiceError instanceof Error ? invoiceError.message : 'Invoice not found';
          throw new Error(message);
        }

        if (!invoiceData) {
          throw new Error('Invoice not found');
        }

        // Fetch the invoice items
        const itemsResponse = await databases.listDocuments(DATABASE_ID, 'invoice_items', [
          Query.equal('invoice_id', invoiceId)
        ]);
        const itemsData = itemsResponse.documents;

        // Transform to our Invoice type
        const items = itemsData.map(item => ({
          id: item.$id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));

        const invoiceType = invoiceTypeFromDocument(invoiceData);
        const loadedInvoice: Invoice = {
          id: invoiceData.$id,
          invoiceNumber: invoiceData.invoice_number,
          clientId: invoiceData.client_id,
          projectId: invoiceData.project_id || "",
          currency: invoiceData.currency || "IDR",
          date: new Date(invoiceData.date),
          dueDate: new Date(invoiceData.due_date),
          paymentTerms: invoiceData.payment_terms,
          items: items,
          subtotal: invoiceData.subtotal,
          taxPercentage: invoiceData.tax_percentage || 0,
          taxAmount: invoiceData.tax_amount || 0,
          discountPercentage: invoiceData.discount_percentage || 0,
          discountAmount: invoiceData.discount_amount || 0,
          total: invoiceData.total,
          notes: invoiceData.notes || "",
          termsAndConditions: invoiceData.terms_and_conditions || "",
          createdAt: new Date(invoiceData.$createdAt),
          status: validateInvoiceStatus(invoiceData.status),
          invoiceType,
          paymentType: invoiceType,
          paymentMode: invoiceData.payment_mode || "percentage",
          paymentPercentage: invoiceData.payment_percentage ?? (invoiceType === "Milestone Payment" ? 25 : 50),
          paymentAmount: invoiceData.payment_amount || invoiceData.total || 0,
          projectTotalSnapshot: invoiceData.project_total_snapshot || 0,
          alreadyPaidSnapshot: invoiceData.already_paid_snapshot || 0,
          remainingAmountSnapshot: invoiceData.remaining_amount_snapshot || 0
        };

        setInvoice(loadedInvoice);

        // Find the client from our Appwrite clients
        if (clients && clients.length > 0) {
          const foundClient = clients.find((c) => c.id === loadedInvoice.clientId);
          setClient(foundClient);
        }
      } catch (error) {
        console.error("Error loading invoice details:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice details. Please try again.",
          variant: "destructive"
        });
        navigate('/invoices');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch invoice after clients are loaded
    if (!isClientsLoading) {
      fetchInvoiceDetails();
    }
  }, [invoiceId, navigate, toast, clients, isClientsLoading]);

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      setIsLoading(true);

      // Delete invoice items first
      const itemsResponse = await databases.listDocuments(DATABASE_ID, 'invoice_items', [
        Query.equal('invoice_id', invoice.id)
      ]);
      for (const item of itemsResponse.documents) {
        await databases.deleteDocument(DATABASE_ID, 'invoice_items', item.$id);
      }

      // Then delete the invoice
      await databases.deleteDocument(DATABASE_ID, 'invoices', invoice.id);

      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted."
      });

      navigate("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleGeneratePDF = () => {
    if (invoice) {
      generatePDF(invoice);
    }
  };

  const handleEdit = () => {
    if (invoice) {
      navigate(`/invoices/edit/${invoice.id}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // If invoice is not loaded yet
  if (isLoading || !invoice || !client) {
    return (
      <main className="p-6">
        <InvoiceLoading />
      </main>
    );
  }

  return (
    <>
      <main className="p-6">
        <InvoiceDetailsHeader
          invoice={invoice}
          onDeleteClick={() => setDeleteConfirmOpen(true)}
          onGeneratePDF={handleGeneratePDF}
          onEditClick={handleEdit}
        />

        <div className="rounded-lg border bg-card shadow-sm">
          <InvoiceInfo
            invoice={invoice}
            client={client}
            formatCurrency={formatCurrency}
          />

          <InvoiceItemsTable
            invoice={invoice}
            formatCurrency={formatCurrency}
          />

          <InvoiceNotesTerm invoice={invoice} />
        </div>
      </main>

      <DeleteInvoiceDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirmDelete={handleDelete}
      />
    </>
  );
};

export default InvoiceDetails;
