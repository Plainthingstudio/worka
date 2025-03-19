
import html2pdf from 'html2pdf.js';
import { format } from 'date-fns';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { generateInvoiceHtml } from './invoiceHtmlGenerator';

/**
 * Generates a PDF for the given invoice and downloads it
 */
export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Fetch client info from database
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', invoice.clientId)
      .single();
    
    if (clientError || !client) {
      console.error('Error fetching client data:', clientError?.message || 'Client not found');
      throw new Error('Client information could not be retrieved');
    }

    // Generate the HTML content for the invoice
    const invoiceHtml = generateInvoiceHtml(invoice, client);
    
    // Create a temporary div element
    const element = document.createElement('div');
    element.innerHTML = invoiceHtml;
    
    // Get the invoice container from the temporary element
    const invoiceElement = element.firstElementChild;
    
    // Append to document body (required for proper rendering)
    if (invoiceElement) {
      document.body.appendChild(invoiceElement);
    } else {
      throw new Error('Failed to create invoice element');
    }
    
    try {
      // Options for html2pdf - Updated to use A4 paper size with proper margins
      const options = {
        margin: 0, // Remove margins to use full width
        filename: `Invoice_${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: null
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', // A4 paper size (210mm × 297mm)
          orientation: 'portrait',
          compress: true,
          putOnlyUsedFonts: true,
          precision: 16 // Higher precision for better text rendering
        }
      };
      
      // Generate PDF using the actual DOM element
      await html2pdf()
        .from(invoiceElement)
        .set(options)
        .save();
    } finally {
      // Clean up - always remove the element from DOM
      if (invoiceElement && invoiceElement.parentNode) {
        invoiceElement.parentNode.removeChild(invoiceElement);
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
