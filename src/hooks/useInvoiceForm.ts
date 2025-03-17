
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Invoice, InvoiceItem } from '@/types';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useInvoiceValidation } from '@/hooks/useInvoiceValidation';
import { useInvoiceData } from '@/hooks/useInvoiceData';
import { useInvoiceCalculations } from '@/hooks/useInvoiceCalculations';
import { useInvoicePdf } from '@/hooks/useInvoicePdf';
import { useInvoices } from '@/hooks/useInvoices';
import { calculateInvoiceTotals } from '@/utils/invoiceCalculations';

export function useInvoiceForm() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  
  // Use the extracted hooks
  const { validateInvoice } = useInvoiceValidation();
  const { saveInvoice: saveToDB } = useInvoices();
  const { invoice: initialInvoice, setInvoice: setBaseInvoice, isLoading, isEditing, fetchInvoice } = useInvoiceData(invoiceId);
  const { formatCurrency } = useInvoiceCalculations(initialInvoice, setBaseInvoice);
  const { generatePDF } = useInvoicePdf();
  
  // Maintain a local state of the invoice to prevent circular updates
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  
  // Update local invoice when the base invoice changes
  useEffect(() => {
    console.log("useInvoiceForm: initialInvoice updated from useInvoiceData:", initialInvoice);
    setInvoice(initialInvoice);
  }, [initialInvoice]);
  
  // Initialize items hook with items from local invoice
  const { 
    items, 
    setItems, 
    addItem, 
    removeItem, 
    updateItem 
  } = useInvoiceItems(invoice?.items || []);
  
  // When items change, update invoice with new totals
  useEffect(() => {
    if (items && Array.isArray(items) && items.length > 0) {
      console.log("useInvoiceForm: Items changed, recalculating totals", items);
      
      // Calculate new totals
      const { 
        subtotal, 
        taxAmount, 
        discountAmount, 
        total,
        updatedItems 
      } = calculateInvoiceTotals(
        items, 
        invoice?.taxPercentage || 0, 
        invoice?.discountPercentage || 0
      );
      
      // Update local invoice with new totals and items
      setInvoice(prev => ({
        ...prev,
        items: updatedItems,
        subtotal,
        taxAmount,
        discountAmount,
        total
      }));
      
      // Also update the base invoice in useInvoiceData
      setBaseInvoice(prev => ({
        ...prev,
        items: updatedItems,
        subtotal,
        taxAmount,
        discountAmount,
        total
      }));
    }
  }, [items, invoice?.taxPercentage, invoice?.discountPercentage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === "taxPercentage" || name === "discountPercentage") {
      const numValue = Number(value);
      console.log(`Updating ${name} to:`, numValue);
      
      setInvoice(prev => ({
        ...prev,
        [name]: numValue
      }));
      
      // Also update the base invoice
      setBaseInvoice(prev => ({
        ...prev,
        [name]: numValue
      }));
    } 
    // Handle other fields
    else {
      console.log(`Updating ${name} to:`, value);
      
      setInvoice(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Also update the base invoice
      setBaseInvoice(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, [setBaseInvoice]);

  const submitInvoice = useCallback(async () => {
    if (!validateInvoice(invoice)) {
      return;
    }

    console.log("Submitting invoice:", invoice);
    const success = await saveToDB(invoice, isEditing);
    if (success) {
      navigate("/invoices");
    }
  }, [invoice, isEditing, validateInvoice, saveToDB, navigate]);

  const handleGeneratePDF = useCallback(() => {
    console.log("Generating PDF for invoice:", invoice);
    generatePDF(invoice);
  }, [invoice, generatePDF]);

  return {
    invoice,
    setInvoice: (value: React.SetStateAction<Invoice>) => {
      // Update both local and base invoice
      const newInvoice = typeof value === 'function' ? value(invoice) : value;
      setInvoice(newInvoice);
      setBaseInvoice(newInvoice);
    },
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
