import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Edit, Download, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { Invoice } from "@/types";
import { clients } from "@/mockData";

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
        <div className="flex-1 pl-14 md:pl-56">
          <main className="container mx-auto py-8">
            <div className="flex items-center justify-center h-64">
              <p>Loading invoice...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/10">
      <Sidebar />
      <div className="flex-1 overflow-auto pl-14 md:pl-56">
        <main className="container mx-auto py-8">
          <div className="mb-6">
            <Link to="/invoices" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">
              Invoice #{invoice.invoiceNumber}
            </h1>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash className="mr-1 h-4 w-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generatePDF}
              >
                <Download className="mr-1 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                size="sm"
                onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit Invoice
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card shadow-sm">
            {/* Invoice Header */}
            <div className="border-b p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-xl font-semibold">Invoice</h2>
                  <div className="mt-2 text-sm">
                    <p>Invoice Number: {invoice.invoiceNumber}</p>
                    <p>Date: {format(new Date(invoice.date), "MMMM dd, yyyy")}</p>
                    <p>Due Date: {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}</p>
                    <p>Payment Terms: {invoice.paymentTerms}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-start md:items-end">
                  <h3 className="font-medium">Billed To:</h3>
                  <div className="mt-1 text-sm">
                    <p className="font-medium">{client.name}</p>
                    <p>{client.email}</p>
                    <p>{client.phone}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Invoice Items */}
            <div className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">Rate</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">${formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right">${formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(invoice.subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxPercentage}%):</span>
                    <span>${formatCurrency(invoice.taxAmount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Discount ({invoice.discountPercentage}%):</span>
                    <span>${formatCurrency(invoice.discountAmount)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes & Terms */}
            {(invoice.notes || invoice.termsAndConditions) && (
              <div className="border-t p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {invoice.notes && (
                    <div>
                      <h3 className="mb-2 font-medium">Notes</h3>
                      <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                    </div>
                  )}
                  
                  {invoice.termsAndConditions && (
                    <div>
                      <h3 className="mb-2 font-medium">Terms and Conditions</h3>
                      <p className="text-sm text-muted-foreground">{invoice.termsAndConditions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
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

export default InvoiceDetails;
