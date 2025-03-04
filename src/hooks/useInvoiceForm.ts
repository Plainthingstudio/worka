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

  useEffect(() => {
    if (isEditing && invoiceId) {
      try {
        console.log("Loading invoice for editing, ID:", invoiceId);
        const storedInvoices: Invoice[] = JSON.parse(localStorage.getItem("invoices") || "[]");
        const existingInvoice = storedInvoices.find((inv) => inv.id === invoiceId);
        
        if (existingInvoice) {
          console.log("Loading existing invoice:", existingInvoice);
          
          const processedItems = Array.isArray(existingInvoice.items) 
            ? existingInvoice.items.map(item => ({
                id: item.id || uuidv4(),
                description: item.description || "",
                quantity: Number(item.quantity) || 1,
                rate: Number(item.rate) || 0,
                amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0)
              }))
            : [emptyItem];
          
          console.log("Processed items for editing:", processedItems);
          
          const processedInvoice = {
            ...existingInvoice,
            date: existingInvoice.date instanceof Date 
              ? existingInvoice.date 
              : new Date(existingInvoice.date),
            dueDate: existingInvoice.dueDate instanceof Date 
              ? existingInvoice.dueDate 
              : new Date(existingInvoice.dueDate),
            createdAt: existingInvoice.createdAt instanceof Date 
              ? existingInvoice.createdAt 
              : new Date(existingInvoice.createdAt),
            items: processedItems,
            taxPercentage: Number(existingInvoice.taxPercentage) || 0,
            discountPercentage: Number(existingInvoice.discountPercentage) || 0
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

  useEffect(() => {
    console.log("Recalculating invoice totals based on items:", invoice.items);
    
    if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
      return;
    }
    
    const updatedItems = invoice.items.map(item => ({
      ...item,
      quantity: Number(item.quantity) || 1,
      rate: Number(item.rate) || 0,
      amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0)
    }));

    const subtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    const taxAmount = (subtotal * (Number(invoice.taxPercentage) || 0)) / 100;
    
    const discountAmount = (subtotal * (Number(invoice.discountPercentage) || 0)) / 100;
    
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
    invoice.items,
    invoice.taxPercentage,
    invoice.discountPercentage
  ]);

  const addItem = useCallback(() => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };

    console.log("Adding new item:", newItem);
    console.log("Current items:", invoice.items);

    setInvoice(prev => {
      const currentItems = Array.isArray(prev.items) ? prev.items : [];
      const updatedInvoice = {
        ...prev,
        items: [...currentItems, newItem]
      };
      console.log("Updated invoice items after add:", updatedInvoice.items);
      return updatedInvoice;
    });
  }, [invoice.items]);

  const removeItem = useCallback((itemId: string) => {
    if (!Array.isArray(invoice.items) || invoice.items.length <= 1) {
      toast({
        title: "Cannot remove item",
        description: "Invoice must have at least one item.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Removing item with ID:", itemId);
    
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  }, [invoice.items, toast]);

  const updateItem = useCallback((id: string, field: keyof InvoiceItem, value: any) => {
    console.log(`Updating item ${id}, field: ${field}, value:`, value);
    
    setInvoice(prev => {
      if (!Array.isArray(prev.items)) {
        return {
          ...prev,
          items: [emptyItem]
        };
      }
      
      return {
        ...prev,
        items: prev.items.map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      };
    });
  }, [emptyItem]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Updating invoice field: ${name}, value:`, value);
    
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

    if (!Array.isArray(invoice.items) || invoice.items.some(item => !item.description || Number(item.quantity) <= 0)) {
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
    console.log("Attempting to save invoice:", invoice);
    
    if (!validateInvoice()) {
      return;
    }

    try {
      const storedInvoices: any[] = JSON.parse(localStorage.getItem("invoices") || "[]");
      
      const finalItems = Array.isArray(invoice.items) ? invoice.items.map(item => ({
        id: item.id,
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0)
      })) : [emptyItem];
      
      const subtotal = finalItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = (subtotal * (Number(invoice.taxPercentage) || 0)) / 100;
      const discountAmount = (subtotal * (Number(invoice.discountPercentage) || 0)) / 100;
      const total = subtotal + taxAmount - discountAmount;
      
      const invoiceToSave = {
        ...invoice,
        date: invoice.date instanceof Date ? invoice.date.toISOString() : invoice.date,
        dueDate: invoice.dueDate instanceof Date ? invoice.dueDate.toISOString() : invoice.dueDate,
        createdAt: invoice.createdAt instanceof Date ? invoice.createdAt.toISOString() : invoice.createdAt,
        items: finalItems,
        subtotal,
        taxAmount,
        discountAmount,
        total
      };
      
      console.log("Saving invoice with items:", invoiceToSave.items);
      
      let updatedInvoices: any[];

      if (isEditing) {
        updatedInvoices = storedInvoices.map(inv => 
          inv.id === invoice.id ? invoiceToSave : inv
        );
        
        toast({
          title: "Invoice updated",
          description: "The invoice has been successfully updated."
        });
      } else {
        updatedInvoices = [...storedInvoices, invoiceToSave];
        
        toast({
          title: "Invoice created",
          description: "The invoice has been successfully created."
        });
      }
      
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      
      navigate("/invoices");
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive"
      });
    }
  }, [invoice, isEditing, navigate, toast, validateInvoice, emptyItem]);

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
