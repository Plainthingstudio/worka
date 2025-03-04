
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceItem, Client } from '@/types';
import { clients } from '@/mockData';
import Sidebar from '@/components/Sidebar';
import InvoiceHeader from '@/components/invoice/InvoiceHeader';
import InvoiceItems from '@/components/invoice/InvoiceItems';
import InvoiceSummary from '@/components/invoice/InvoiceSummary';
import InvoiceNotes from '@/components/invoice/InvoiceNotes';
import InvoiceActions from '@/components/invoice/InvoiceActions';

const InvoiceForm = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(invoiceId);

  const emptyItem: InvoiceItem = {
    id: uuidv4(),
    description: "",
    quantity: 1,
    rate: 0,
    amount: 0,
  };

  const [invoice, setInvoice] = useState<Invoice>({
    id: uuidv4(),
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
    clientId: "",
    date: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentTerms: "Net 30",
    items: [emptyItem],
    subtotal: 0,
    taxPercentage: 0,
    taxAmount: 0,
    discountPercentage: 0,
    discountAmount: 0,
    total: 0,
    notes: "",
    termsAndConditions: "Payment is due within the specified term. Please make the payment to the specified account.",
    createdAt: new Date(),
    status: "Draft",
  });

  useEffect(() => {
    if (isEditing && invoiceId) {
      const invoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
      const existingInvoice = invoices.find((inv) => inv.id === invoiceId);
      
      if (existingInvoice) {
        existingInvoice.date = new Date(existingInvoice.date);
        existingInvoice.dueDate = new Date(existingInvoice.dueDate);
        existingInvoice.createdAt = new Date(existingInvoice.createdAt);
        
        setInvoice(existingInvoice);
      }
    }
  }, [isEditing, invoiceId]);

  useEffect(() => {
    const updatedItems = invoice.items.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));

    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    const taxAmount = (subtotal * invoice.taxPercentage) / 100;
    
    const discountAmount = (subtotal * invoice.discountPercentage) / 100;
    
    const total = subtotal + taxAmount - discountAmount;

    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      taxAmount,
      discountAmount,
      total
    }));
  }, [
    invoice.items.map(item => item.quantity).join(','),
    invoice.items.map(item => item.rate).join(','),
    invoice.taxPercentage,
    invoice.discountPercentage
  ]);

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem, id: uuidv4() }]
    }));
  };

  const removeItem = (itemId: string) => {
    if (invoice.items.length === 1) {
      toast({
        title: "Cannot remove item",
        description: "Invoice must have at least one item.",
        variant: "destructive"
      });
      return;
    }
    
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: field === "quantity" || field === "rate" ? Number(value) : value } : item
      )
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "taxPercentage" || name === "discountPercentage") {
      setInvoice(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = () => {
    if (!invoice.clientId) {
      toast({
        title: "Missing client",
        description: "Please select a client for this invoice.",
        variant: "destructive"
      });
      return;
    }

    if (invoice.items.some(item => !item.description || item.quantity <= 0)) {
      toast({
        title: "Invalid items",
        description: "Please ensure all items have a description and positive quantity.",
        variant: "destructive"
      });
      return;
    }

    // Get existing invoices from localStorage
    const existingInvoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    
    let updatedInvoices: Invoice[];
    if (isEditing) {
      // Update existing invoice
      updatedInvoices = existingInvoices.map(inv => 
        inv.id === invoice.id ? invoice : inv
      );
      
      toast({
        title: "Invoice updated",
        description: "The invoice has been successfully updated."
      });
    } else {
      // Add new invoice
      updatedInvoices = [...existingInvoices, invoice];
      
      toast({
        title: "Invoice created",
        description: "The invoice has been successfully created."
      });
    }
    
    // Save to localStorage
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    
    // Navigate back to invoices list
    navigate("/invoices");
  };

  const generatePDF = () => {
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
          
          <h1 className="mb-8 text-2xl font-semibold tracking-tight">
            {isEditing ? "Edit Invoice" : "Generate New Invoice"}
          </h1>

          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <InvoiceHeader 
              invoice={invoice} 
              clients={clients} 
              setInvoice={setInvoice} 
            />

            <InvoiceItems 
              invoice={invoice}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
              formatCurrency={formatCurrency}
            />

            <InvoiceSummary 
              invoice={invoice}
              formatCurrency={formatCurrency}
              handleInputChange={handleInputChange}
            />

            <InvoiceNotes 
              invoice={invoice} 
              handleInputChange={handleInputChange} 
            />

            <InvoiceActions 
              isEditing={isEditing} 
              onSubmit={handleSubmit} 
              onGeneratePDF={generatePDF} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceForm;
