
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useInvoiceValidation } from '@/hooks/useInvoiceValidation';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateInvoiceTotals, 
  createNewInvoice, 
  formatCurrency 
} from '@/utils/invoiceCalculations';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { useInvoices } from '@/hooks/useInvoices';

export function useInvoiceForm() {
  const navigate = useNavigate();
  const { invoiceId } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(invoiceId);
  const { validateInvoice } = useInvoiceValidation();
  const { saveInvoice } = useInvoices();

  // Initialize with empty invoice
  const [invoice, setInvoice] = useState<Invoice>(createNewInvoice());
  const [isLoading, setIsLoading] = useState(isEditing);
  const [initialInvoiceItems, setInitialInvoiceItems] = useState(invoice.items);
  
  // Load invoice data when in edit mode
  useEffect(() => {
    if (isEditing && invoiceId) {
      const fetchInvoice = async () => {
        setIsLoading(true);
        try {
          // Check if user is authenticated
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            toast({
              title: "Authentication Error",
              description: "You must be logged in to edit invoices.",
              variant: "destructive"
            });
            navigate('/login');
            return;
          }

          // Fetch the invoice
          const { data: invoiceData, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .maybeSingle();
          
          if (invoiceError || !invoiceData) {
            throw new Error(invoiceError?.message || 'Invoice not found');
          }

          // Fetch the invoice items
          const { data: itemsData, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoiceId);
          
          if (itemsError) {
            throw new Error(itemsError.message);
          }

          // Transform to our Invoice type
          const items = itemsData.map(item => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
          }));

          const loadedInvoice: Invoice = {
            id: invoiceData.id,
            invoiceNumber: invoiceData.invoice_number,
            clientId: invoiceData.client_id,
            date: new Date(invoiceData.date),
            dueDate: new Date(invoiceData.due_date),
            paymentTerms: invoiceData.payment_terms,
            items: items,
            subtotal: invoiceData.subtotal,
            taxPercentage: invoiceData.tax_percentage || 0,
            taxAmount: invoiceData.tax_amount || 0,
            discountPercentage: invoiceData.discount_percentage || 0,
            discountAmount: invoiceData.discount_amount || 0,
            total: invoiceData.total,
            notes: invoiceData.notes || "",
            termsAndConditions: invoiceData.terms_and_conditions || "",
            createdAt: new Date(invoiceData.created_at),
            status: invoiceData.status
          };

          setInvoice(loadedInvoice);
          setInitialInvoiceItems(items);
        } catch (error) {
          console.error("Error loading invoice:", error);
          toast({
            title: "Error",
            description: "Failed to load invoice. Please try again.",
            variant: "destructive"
          });
          navigate('/invoices');
        } finally {
          setIsLoading(false);
        }
      };

      fetchInvoice();
    }
  }, [isEditing, invoiceId, navigate, toast]);
  
  // Initialize items hook with invoice items
  const { 
    items, 
    setItems, 
    addItem, 
    removeItem, 
    updateItem 
  } = useInvoiceItems(initialInvoiceItems);
  
  // Sync items with invoice
  useEffect(() => {
    if (Array.isArray(items) && items.length > 0) {
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

  const submitInvoice = useCallback(async () => {
    if (!validateInvoice(invoice)) {
      return;
    }

    const success = await saveInvoice(invoice, isEditing);
    if (success) {
      navigate("/invoices");
    }
  }, [invoice, isEditing, validateInvoice, saveInvoice, navigate]);

  const generatePDF = useCallback(() => {
    try {
      generateInvoicePDF(invoice);
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been created and downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  }, [invoice, toast]);

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
