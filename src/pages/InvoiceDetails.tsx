
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Invoice } from "@/types";
import { clients } from "@/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useSidebarState } from "@/hooks/useSidebarState";

// Import refactored components
import InvoiceDetailsHeader from "@/components/invoice-details/InvoiceDetailsHeader";
import InvoiceInfo from "@/components/invoice-details/InvoiceInfo";
import InvoiceItemsTable from "@/components/invoice-details/InvoiceItemsTable";
import InvoiceNotesTerm from "@/components/invoice-details/InvoiceNotesTerm";
import DeleteInvoiceDialog from "@/components/invoice-details/DeleteInvoiceDialog";
import InvoiceLoading from "@/components/invoice-details/InvoiceLoading";

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSidebarExpanded } = useSidebarState();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch invoice and related data
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!invoiceId) return;
      
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Authentication Error",
            description: "You must be logged in to view invoice details.",
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
        
        // Transform to our Invoice type
        const items = itemsData.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount
        }));
        
        const loadedInvoice: Invoice = {
          id: invoiceData.id,
          invoiceNumber: invoiceData.invoice_number,
          clientId: invoiceData.client_id,
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
          createdAt: new Date(invoiceData.created_at),
          status: invoiceData.status
        };
        
        setInvoice(loadedInvoice);
        
        // Find the client
        const foundClient = clients.find((c) => c.id === loadedInvoice.clientId);
        setClient(foundClient);
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
    
    fetchInvoiceDetails();
  }, [invoiceId, navigate, toast]);

  const handleDelete = async () => {
    if (!invoice) return;
    
    try {
      setIsLoading(true);
      
      // Delete invoice items first
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoice.id);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // Then delete the invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);
      
      if (invoiceError) {
        throw invoiceError;
      }
      
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

  const generatePDF = () => {
    // In a real application, this would generate a PDF
    toast({
      title: "PDF Generated",
      description: "In a production app, this would generate and download a PDF.",
    });
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
      <div className="flex h-screen bg-muted/10">
        <Sidebar />
        <div 
          className={`flex-1 w-full transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? "ml-56" : "ml-14"
          }`}
        >
          <Navbar title="Invoice Details" />
          <main className="p-6">
            <InvoiceLoading />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div 
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}
      >
        <Navbar title="Invoice Details" />
        <main className="p-6">
          <InvoiceDetailsHeader 
            invoice={invoice}
            onDeleteClick={() => setDeleteConfirmOpen(true)}
            onGeneratePDF={generatePDF}
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
      </div>

      <DeleteInvoiceDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirmDelete={handleDelete}
      />
    </div>
  );
};

export default InvoiceDetails;
