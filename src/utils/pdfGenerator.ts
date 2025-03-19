
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { PAGE_CONFIG, COLORS } from './pdf/pdfStyles';
import { renderInvoiceHeader } from './pdf/invoiceHeaderRenderer';
import { renderInvoiceItems } from './pdf/invoiceItemsRenderer';
import { renderInvoiceTotals } from './pdf/invoiceTotalsRenderer';
import { renderTermsAndNotes } from './pdf/invoiceTermsRenderer';
import { InvoiceTemplate } from '@/types/template';
import { defaultTemplate } from '@/hooks/useInvoiceTemplates';

export const generateInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    // Get active template from localStorage or use default
    let activeTemplate: InvoiceTemplate | null = null;
    const savedTemplates = localStorage.getItem('invoiceTemplates');
    
    if (savedTemplates) {
      const templates = JSON.parse(savedTemplates);
      activeTemplate = templates.find((t: InvoiceTemplate) => t.isDefault) || null;
    }
    
    const template = activeTemplate || defaultTemplate;
    
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
    
    // Initialize PDF document with points unit
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });
    
    // Apply template font
    pdf.setFont(template.style.fontFamily || "helvetica");
    
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
    
    // Save the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
