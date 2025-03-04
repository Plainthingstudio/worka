
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/Sidebar";
import { Client, Invoice, InvoiceItem } from "@/types";
import { clients } from "@/mockData";
import { v4 as uuidv4 } from "uuid";

// Import uuid
<lov-add-dependency>uuid@latest @types/uuid@latest</lov-add-dependency>

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
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
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

  // Load invoice data if editing
  useEffect(() => {
    if (isEditing && invoiceId) {
      const invoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
      const existingInvoice = invoices.find((inv) => inv.id === invoiceId);
      
      if (existingInvoice) {
        // Make sure dates are Date objects
        existingInvoice.date = new Date(existingInvoice.date);
        existingInvoice.dueDate = new Date(existingInvoice.dueDate);
        existingInvoice.createdAt = new Date(existingInvoice.createdAt);
        
        setInvoice(existingInvoice);
      }
    }
  }, [isEditing, invoiceId]);

  // Calculate all amounts when items or percentages change
  useEffect(() => {
    // Calculate the amount for each item
    const updatedItems = invoice.items.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));

    // Calculate subtotal
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate tax amount
    const taxAmount = (subtotal * invoice.taxPercentage) / 100;
    
    // Calculate discount amount
    const discountAmount = (subtotal * invoice.discountPercentage) / 100;
    
    // Calculate total
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

    // Save the invoice
    const invoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    
    if (isEditing) {
      const updatedInvoices = invoices.map(inv => 
        inv.id === invoice.id ? invoice : inv
      );
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      toast({
        title: "Invoice updated",
        description: "The invoice has been successfully updated."
      });
    } else {
      const newInvoices = [...invoices, invoice];
      localStorage.setItem("invoices", JSON.stringify(newInvoices));
      
      toast({
        title: "Invoice created",
        description: "The invoice has been successfully created."
      });
    }
    
    // Redirect to the invoices list
    navigate("/invoices");
  };

  const generatePDF = () => {
    // In a real application, this would generate a PDF
    // For this demo, we'll just show a toast message
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
            {/* Invoice Header */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={invoice.invoiceNumber}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="clientId">Bill To</Label>
                <Select
                  value={invoice.clientId}
                  onValueChange={(value) => setInvoice(prev => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: Client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {invoice.clientId && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {(() => {
                      const client = clients.find(c => c.id === invoice.clientId);
                      return client ? (
                        <>
                          <div>{client.email}</div>
                          <div>{client.phone}</div>
                        </>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-normal"
                    >
                      {format(invoice.date, "PP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={invoice.date}
                      onSelect={(date) => setInvoice(prev => ({ ...prev, date: date || new Date() }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="mt-1 w-full justify-start text-left font-normal"
                    >
                      {format(invoice.dueDate, "PP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={invoice.dueDate}
                      onSelect={(date) => setInvoice(prev => ({ ...prev, dueDate: date || new Date() }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                name="paymentTerms"
                value={invoice.paymentTerms}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            {/* Invoice Items */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Invoice Items</h3>
              
              <div className="mb-3 grid grid-cols-12 gap-2 rounded-t-md bg-muted/50 p-3 font-medium">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
              
              {invoice.items.map((item) => (
                <div key={item.id} className="mb-2 grid grid-cols-12 gap-2 rounded-md border p-2">
                  <div className="col-span-5">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      className="text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={formatCurrency(item.rate)}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, '');
                          updateItem(item.id, "rate", parseFloat(value) || 0);
                        }}
                        className="pl-8 text-center"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    ${formatCurrency(item.amount)}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={addItem}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Line Item
              </Button>
            </div>

            {/* Invoice Summary */}
            <div className="mt-6 grid gap-3">
              <div className="ml-auto grid w-64 grid-cols-2 gap-2">
                <div className="text-right">Subtotal:</div>
                <div className="text-right">${formatCurrency(invoice.subtotal)}</div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <Label className="mr-2" htmlFor="taxPercentage">Tax:</Label>
                    <Input
                      id="taxPercentage"
                      name="taxPercentage"
                      type="number"
                      min="0"
                      className="w-16 text-right"
                      value={invoice.taxPercentage}
                      onChange={handleInputChange}
                    />
                    <span className="ml-1">%</span>
                  </div>
                </div>
                <div className="text-right">${formatCurrency(invoice.taxAmount)}</div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <Label className="mr-2" htmlFor="discountPercentage">Discount:</Label>
                    <Input
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      min="0"
                      className="w-16 text-right"
                      value={invoice.discountPercentage}
                      onChange={handleInputChange}
                    />
                    <span className="ml-1">%</span>
                  </div>
                </div>
                <div className="text-right">${formatCurrency(invoice.discountAmount)}</div>
                
                <div className="text-right font-medium">Total:</div>
                <div className="text-right font-medium">${formatCurrency(invoice.total)}</div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={invoice.notes}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[100px]"
                  placeholder="Additional notes for the client"
                />
              </div>
              
              <div>
                <Label htmlFor="termsAndConditions">Terms and Conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  value={invoice.termsAndConditions}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[100px]"
                  placeholder="Payment terms and conditions"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/invoices")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={generatePDF}
              >
                <Eye className="mr-1 h-4 w-4" />
                Preview
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={generatePDF}
              >
                Generate PDF
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
              >
                {isEditing ? "Update Invoice" : "Save Invoice"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoiceForm;
