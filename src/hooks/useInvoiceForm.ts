
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceItem } from '@/types';

export function useInvoiceForm() {
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

  // Load existing invoice for editing
  useEffect(() => {
    if (isEditing && invoiceId) {
      try {
        const storedInvoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
        const existingInvoice = storedInvoices.find((inv) => inv.id === invoiceId);
        
        if (existingInvoice) {
          console.log("Loading existing invoice:", existingInvoice);
          
          // Convert date strings back to Date objects
          const processedInvoice = {
            ...existingInvoice,
            date: new Date(existingInvoice.date),
            dueDate: new Date(existingInvoice.dueDate),
            createdAt: new Date(existingInvoice.createdAt),
            // Process items with correct types and ensure they have IDs
            items: existingInvoice.items && existingInvoice.items.length > 0 
              ? existingInvoice.items.map(item => ({
                  id: item.id || uuidv4(),
                  description: item.description || "",
                  quantity: Number(item.quantity) || 1,
                  rate: Number(item.rate) || 0,
                  amount: Number(item.quantity || 1) * Number(item.rate || 0)
                }))
              : [emptyItem]
          };
          
          setInvoice(processedInvoice);
          console.log("Processed invoice for editing:", processedInvoice);
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice data",
          variant: "destructive"
        });
      }
    }
  }, [isEditing, invoiceId, toast, emptyItem]);

  // Recalculate totals when items, tax or discount change
  useEffect(() => {
    // Create a new copy of items with updated amounts
    const updatedItems = invoice.items.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number(item.quantity) * Number(item.rate)
    }));

    // Calculate subtotal from item amounts
    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate tax amount
    const taxAmount = (subtotal * invoice.taxPercentage) / 100;
    
    // Calculate discount amount
    const discountAmount = (subtotal * invoice.discountPercentage) / 100;
    
    // Calculate total
    const total = subtotal + taxAmount - discountAmount;

    // Update invoice state with new calculations
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

  const addItem = useCallback(() => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { ...emptyItem, id: uuidv4() }]
    }));
  }, [emptyItem]);

  const removeItem = useCallback((itemId: string) => {
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
  }, [invoice.items.length, toast]);

  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  }, []);

  const validateInvoice = useCallback((): boolean => {
    if (!invoice.clientId) {
      toast({
        title: "Missing client",
        description: "Please select a client for this invoice.",
        variant: "destructive"
      });
      return false;
    }

    if (invoice.items.some(item => !item.description || item.quantity <= 0)) {
      toast({
        title: "Invalid items",
        description: "Please ensure all items have a description and positive quantity.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [invoice.clientId, invoice.items, toast]);

  const saveInvoice = useCallback(() => {
    if (!validateInvoice()) {
      return;
    }

    try {
      // Get existing invoices from localStorage
      const storedInvoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
      
      // Prepare invoice for saving with explicitly calculated values
      const finalItems = invoice.items.map(item => ({
        id: item.id,
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.quantity) * Number(item.rate)
      }));
      
      const subtotal = finalItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = (subtotal * invoice.taxPercentage) / 100;
      const discountAmount = (subtotal * invoice.discountPercentage) / 100;
      const total = subtotal + taxAmount - discountAmount;
      
      const invoiceToSave = {
        ...invoice,
        items: finalItems,
        subtotal,
        taxAmount,
        discountAmount,
        total
      };
      
      console.log("Saving invoice with items:", invoiceToSave.items);
      
      let updatedInvoices: Invoice[];

      if (isEditing) {
        // Update existing invoice
        updatedInvoices = storedInvoices.map(inv => 
          inv.id === invoice.id ? invoiceToSave : inv
        );
        
        toast({
          title: "Invoice updated",
          description: "The invoice has been successfully updated."
        });
      } else {
        // Add new invoice
        updatedInvoices = [...storedInvoices, invoiceToSave];
        
        toast({
          title: "Invoice created",
          description: "The invoice has been successfully created."
        });
      }
      
      // Save to localStorage
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      // Navigate back to invoices list
      navigate("/invoices");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive"
      });
    }
  }, [invoice, isEditing, navigate, toast, validateInvoice]);

  const formatCurrency = useCallback((amount: number) => {
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const generatePDF = useCallback(() => {
    toast({
      title: "PDF Generated",
      description: "In a production app, this would generate and download a PDF.",
    });
  }, [toast]);

  return {
    invoice,
    setInvoice,
    isEditing,
    addItem,
    removeItem,
    updateItem,
    handleInputChange,
    saveInvoice,
    generatePDF,
    formatCurrency
  };
}
