import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Invoice } from '@/types';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useInvoiceValidation } from '@/hooks/useInvoiceValidation';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useInvoiceCalculations } from '@/hooks/useInvoiceCalculations';
import { useInvoicePdf } from '@/hooks/useInvoicePdf';
import { useInvoices } from '@/hooks/useInvoices';

export function useInvoiceForm() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  
  // Use the extracted hooks
  const { validateInvoice } = useInvoiceValidation();
  const { saveInvoice: saveToDB } = useInvoices();
  const { invoice, setInvoice, isLoading, isEditing, fetchInvoice } = useInvoiceData(invoiceId);
  const { formatCurrency } = useInvoiceCalculations(invoice, setInvoice);
  const { generatePDF } = useInvoicePdf();
  
  // Initialize items hook with items from invoice
  const { 
    items, 
    setItems, 
    addItem, 
    removeItem, 
    updateItem 
  } = useInvoiceItems(invoice?.items || []);
  
  // When invoice is loaded/changed, update the items state
  useEffect(() => {
    if (invoice?.items && Array.isArray(invoice.items) && invoice.items.length > 0) {
      console.log("useInvoiceForm: Setting invoice items to items state:", invoice.items);
      setItems(invoice.items);
    }
  }, [invoice?.id, invoice?.items, setItems]);

  // Keep the invoice items in sync with the items from useInvoiceItems
  useEffect(() => {
    if (items && Array.isArray(items) && items.length > 0) {
      console.log("useInvoiceForm: Syncing items to invoice:", items);
      setInvoice(prev => {
        // Only update if items have actually changed
        if (JSON.stringify(prev.items) !== JSON.stringify(items)) {
          return {
            ...prev,
            items
          };
        }
        return prev;
      });
    }
  }, [items, setInvoice]);

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
  }, [setInvoice]);

  const submitInvoice = useCallback(async () => {
    if (!validateInvoice(invoice)) {
      return;
    }

    const success = await saveToDB(invoice, isEditing);
    if (success) {
      navigate("/invoices");
    }
  }, [invoice, isEditing, validateInvoice, saveToDB, navigate]);

  const handleGeneratePDF = useCallback(() => {
    generatePDF(invoice);
  }, [invoice, generatePDF]);

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
    generatePDF: handleGeneratePDF,
    formatCurrency
  };
}
