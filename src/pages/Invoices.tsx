import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { clients } from "@/mockData";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Invoice } from "@/types";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import InvoicesFilter from "@/components/invoices/InvoicesFilter";
import InvoicesTable from "@/components/invoices/InvoicesTable";

const Invoices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const storedInvoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    setInvoices(storedInvoices);
  }, [location]);

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };
    handleSidebarChange();
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    return () => observer.disconnect();
  }, []);

  const confirmDelete = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!invoiceToDelete) return;
    const updatedInvoices = invoices.filter(i => i.id !== invoiceToDelete);
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    toast({
      title: "Invoice deleted",
      description: "The invoice has been successfully deleted."
    });
    setDeleteConfirmOpen(false);
    setInvoiceToDelete(null);
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

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}/edit`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || getClientName(invoice.clientId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                        (statusFilter === "paid" && invoice.status === "Paid") || 
                        (statusFilter === "unpaid" && invoice.status !== "Paid") || 
                        (statusFilter === "overdue" && invoice.status === "Overdue");
    return matchesSearch && matchesStatus;
  });

  return <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Invoices" />
        <main className="container mx-auto p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Invoices
              </h1>
              <p className="text-muted-foreground">
                Track and manage all your client invoices.
              </p>
            </div>
            <Button onClick={() => navigate("/invoices/new")} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Generate New Invoice
            </Button>
          </div>

          <InvoicesFilter search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

          <div className="glass-card rounded-xl border shadow-sm animate-fade-in">
            <div className="overflow-x-auto p-4 py-[8px] px-[8px]">
              <InvoicesTable invoices={filteredInvoices} getClientName={getClientName} onView={handleViewInvoice} onEdit={handleEditInvoice} onDelete={confirmDelete} onDownload={handleDownload} />
            </div>
          </div>
        </main>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
};

export default Invoices;
