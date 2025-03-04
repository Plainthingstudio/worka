
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types';
import { useInvoiceStorage } from '@/hooks/useInvoiceStorage';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useInvoiceValidation } from '@/hooks/useInvoiceValidation';
import { 
  calculateInvoiceTotals, 
  createNewInvoice, 
  formatCurrency 
} from '@/utils/invoiceCalculations';

export function useInvoiceForm() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(invoiceId);
  const { loadInvoice, saveInvoice } = useInvoiceStorage();

  const { validateInvoice } = useInvoiceValidation();

  // Initialize with empty invoice
  const [invoice, setInvoice] = useState<Invoice>(createNewInvoice());
  const [isLoading, setIsLoading] = useState(isEditing);
  
  // Load invoice data when in edit mode
  useEffect(() => {
    if (isEditing && invoiceId) {
      setIsLoading(true);
      console.log("Loading existing invoice data for editing, ID:", invoiceId);
      const loadedInvoice = loadInvoice(invoiceId);
      
      if (loadedInvoice) {
        console.log("Setting invoice from loaded data:", loadedInvoice);
        setInvoice(loadedInvoice);
      }
      
      setIsLoading(false);
    }
  }, [isEditing, invoiceId, loadInvoice]);
  
  // Initialize items hook with invoice items
  const { 
    items, 
    setItems, 
    addItem, 
    removeItem, 
    updateItem 
  } = useInvoiceItems(invoice.items);
  
  // Sync items with invoice
  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
      console.log("Syncing items with invoice:", items);
      setInvoice(prev => ({
        ...prev,
        items
      }));
    }
  }, [items]);

  // Calculate totals whenever relevant invoice fields change
  useEffect(() => {
    if (!invoice || !Array.isArray(invoice.items)) return;
    
    const { 
      subtotal, 
      taxAmount, 
      discountAmount, 
      total, 
      updatedItems 
    } = calculateInvoiceTotals(
      invoice.items, 
      invoice.taxPercentage, 
      invoice.discountPercentage
    );

    setInvoice(prev => ({
      ...prev,
      items: updatedItems,
      subtotal,
      taxAmount,
      discountAmount,
      total
    }));
  }, [
    invoice?.items,
    invoice?.taxPercentage,
    invoice?.discountPercentage
  ]);

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

  const submitInvoice = useCallback(() => {
    console.log("Attempting to save invoice:", invoice);
    
    if (!validateInvoice(invoice)) {
      return;
    }

    const success = saveInvoice(invoice, isEditing);
    if (success) {
      navigate("/invoices");
    }
  }, [invoice, isEditing, validateInvoice, saveInvoice, navigate]);

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
    isLoading,
    addItem,
    removeItem,
    updateItem,
    handleInputChange,
    saveInvoice: submitInvoice,
    generatePDF,
    formatCurrency
  };
}
