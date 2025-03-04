
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Invoice } from "@/types";
import { clients } from "@/mockData";

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
  const location = useLocation();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    // Get invoice from localStorage
    const invoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    const foundInvoice = invoices.find((inv) => inv.id === invoiceId);
    
    if (foundInvoice) {
      setInvoice(foundInvoice);
      
      // Find the client
      const foundClient = clients.find((c) => c.id === foundInvoice.clientId);
      setClient(foundClient);
    } else {
      toast({
        title: "Invoice not found",
        description: "The requested invoice could not be found.",
        variant: "destructive",
      });
      navigate("/invoices");
    }
  }, [invoiceId, navigate, toast, location]);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const handleDelete = () => {
    if (!invoice) return;

    const invoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    const updatedInvoices = invoices.filter((inv) => inv.id !== invoice.id);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));

    toast({
      title: "Invoice deleted",
      description: "The invoice has been successfully deleted.",
    });

    navigate("/invoices");
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
  if (!invoice || !client) {
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
