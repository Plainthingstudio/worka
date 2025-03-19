
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { FONTS, COLORS, PAGE_CONFIG, POSITIONS } from './pdf/pdfStyles';
import { renderInvoiceHeader } from './pdf/invoiceHeaderRenderer';
import { renderInvoiceItems } from './pdf/invoiceItemsRenderer';
import { renderInvoiceTotals } from './pdf/invoiceTotalsRenderer';
import { renderTermsAndNotes } from './pdf/invoiceTermsRenderer';

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
    
    // Initialize PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // Set default font
    doc.setFont(FONTS.family.main);
    
    // Render invoice header (including client info)
    let currentY = renderInvoiceHeader(
      doc,
      invoice.invoiceNumber,
      new Date(invoice.date),
      new Date(invoice.dueDate),
      invoice.total,
      client.name,
      client.address,
      client.phone
    );
    
    // Render invoice items table
    currentY = renderInvoiceItems(doc, invoice.items, currentY);
    
    // Render invoice totals section
    currentY = renderInvoiceTotals(
      doc,
      currentY,
      invoice.subtotal,
      invoice.taxPercentage,
      invoice.taxAmount,
      invoice.discountPercentage,
      invoice.discountAmount,
      invoice.total
    );
    
    // Render terms and notes
    renderTermsAndNotes(
      doc,
      currentY,
      invoice.termsAndConditions,
      invoice.notes
    );
    
    // Save the PDF
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
