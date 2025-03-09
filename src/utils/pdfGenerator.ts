
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { PAGE_CONFIG, COLORS, LINE_WIDTH } from './pdf/pdfStyles';
import { renderInvoiceHeader } from './pdf/invoiceHeaderRenderer';
import { renderInvoiceItems } from './pdf/invoiceItemsRenderer';
import { renderInvoiceTotals } from './pdf/invoiceTotalsRenderer';
import { renderTermsAndNotes } from './pdf/invoiceTermsRenderer';

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Fetch client info from database
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', invoice.clientId)
      .single();
    
    if (clientError || !clientData) {
      console.error('Error fetching client data:', clientError?.message || 'Client not found');
      throw new Error('Client information could not be retrieved');
    }
    
    const client = clientData;
    
    // Initialize PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Render invoice components in sequence
    let currentY = renderInvoiceHeader(
      pdf,
      invoice.invoiceNumber,
      invoice.date,
      invoice.dueDate,
      invoice.total,
      client.name,
      client.address,
      client.phone
    );
    
    currentY = renderInvoiceItems(pdf, invoice.items, currentY);
    
    currentY = renderInvoiceTotals(
      pdf,
      currentY,
      invoice.subtotal,
      invoice.taxPercentage,
      invoice.taxAmount,
      invoice.discountPercentage,
      invoice.discountAmount,
      invoice.total
    );
    
    renderTermsAndNotes(
      pdf,
      currentY,
      invoice.termsAndConditions,
      invoice.notes
    );
    
    // Add very light shadow effect to the whole document
    pdf.setDrawColor(...COLORS.line.light);
    pdf.setLineWidth(LINE_WIDTH.thin);
    pdf.rect(5, 5, PAGE_CONFIG.width - 10, PAGE_CONFIG.height - 10, 'S');
    
    // Save the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
