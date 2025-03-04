
import { Invoice, InvoiceItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createEmptyItem } from '@/utils/invoiceCalculations';
import { useCallback } from 'react';

export function useInvoiceStorage() {
  const { toast } = useToast();

  const loadInvoice = useCallback((invoiceId: string): Invoice | null => {
    try {
      console.log("Loading invoice for editing, ID:", invoiceId);
      const storedInvoices: any[] = JSON.parse(localStorage.getItem("invoices") || "[]");
      const existingInvoice = storedInvoices.find((inv) => inv.id === invoiceId);
      
      if (existingInvoice) {
        console.log("Found existing invoice:", existingInvoice);
        
        // Properly process items to ensure they're in the correct format
        const processedItems = Array.isArray(existingInvoice.items) 
          ? existingInvoice.items.map((item: any) => ({
              id: item.id || crypto.randomUUID(),
              description: item.description || "",
              quantity: Number(item.quantity) || 1,
              rate: Number(item.rate) || 0,
              amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0)
            }))
          : [createEmptyItem()];
        
        console.log("Processed items for editing:", processedItems);
        
        // Create proper Date objects for all date fields
        const processedInvoice: Invoice = {
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
        
        console.log("Processed invoice for editing:", processedInvoice);
        return processedInvoice;
      }
      return null;
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const saveInvoice = useCallback((invoice: Invoice, isEditing: boolean) => {
    try {
      const storedInvoices: any[] = JSON.parse(localStorage.getItem("invoices") || "[]");
      
      const finalItems = Array.isArray(invoice.items) ? invoice.items.map(item => ({
        id: item.id,
        description: item.description || "",
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: (Number(item.quantity) || 1) * (Number(item.rate) || 0)
      })) : [createEmptyItem()];
      
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
        // Add new invoices at the beginning of the array instead of the end
        updatedInvoices = [invoiceToSave, ...storedInvoices];
        
        toast({
          title: "Invoice created",
          description: "The invoice has been successfully created."
        });
      }
      
      localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
      return true;
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    loadInvoice,
    saveInvoice
  };
}
