
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Plus, Eye, Edit, Trash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { clients } from "@/mockData";
import Sidebar from "@/components/Sidebar";
import { Invoice } from "@/types";

const Invoices = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Load invoices from localStorage whenever the component mounts or location changes
  // This ensures the list refreshes when returning from the edit page
  useEffect(() => {
    const storedInvoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    setInvoices(storedInvoices);
  }, [location]);

  const confirmDelete = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!invoiceToDelete) return;

    const updatedInvoices = invoices.filter((i) => i.id !== invoiceToDelete);
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));

    toast({
      title: "Invoice deleted",
      description: "The invoice has been successfully deleted.",
    });

    setDeleteConfirmOpen(false);
    setInvoiceToDelete(null);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-14 md:pl-56">
        <main className="container mx-auto py-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
            <Button
              onClick={() => navigate("/invoices/new")}
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Generate New Invoice
            </Button>
          </div>

          <div className="rounded-lg border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-medium">Invoice List</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{getClientName(invoice.clientId)}</TableCell>
                        <TableCell>
                          {format(new Date(invoice.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          ${invoice.total.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/invoices/${invoice.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => confirmDelete(invoice.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No invoices found. Create your first invoice to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
