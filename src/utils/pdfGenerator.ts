
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { PAGE_CONFIG, COLORS } from './pdf/pdfStyles';
import { format } from 'date-fns';
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
    
    // Header section
    // Add text: "Invoice"
    pdf.setFontSize(27);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Invoice", 68, 40);
    
    // Add text: "Invoice no:"
    pdf.setFontSize(12);
    pdf.setTextColor(121, 137, 150);
    pdf.text("Invoice no:", 541, 38);
    
    // Add invoice number
    pdf.setFontSize(18);
    pdf.setTextColor(25, 34, 41);
    pdf.text(invoice.invoiceNumber, 543, 56);
    
    // Client Section
    // Add text: "Billed to:"
    pdf.setFontSize(13);
    pdf.setTextColor(121, 137, 150);
    pdf.text("Billed to:", 50, 144);
    
    // Add client name
    pdf.setFontSize(17);
    pdf.setTextColor(25, 34, 41);
    pdf.text(client.name, 70, 174);
    
    // Add client address
    pdf.setFontSize(12);
    pdf.setTextColor(121, 137, 150);
    pdf.text(client.address || "Address not provided", 83, 195);
    
    // Date Section
    // Add text: "Issued on:"
    pdf.setFontSize(12);
    pdf.setTextColor(121, 137, 150);
    pdf.text("Issued on:", 538, 140);
    
    // Add issue date
    pdf.setFontSize(13);
    pdf.setTextColor(25, 34, 41);
    const formattedIssueDate = format(new Date(invoice.date), "dd MMMM, yyyy");
    pdf.text(formattedIssueDate, 522, 157);
    
    // Add text: "Payment Due:"
    pdf.setFontSize(12);
    pdf.setTextColor(121, 137, 150);
    pdf.text("Payment Due:", 530, 186);
    
    // Add due date
    pdf.setFontSize(13);
    pdf.setTextColor(25, 34, 41);
    const formattedDueDate = format(new Date(invoice.dueDate), "dd MMMM, yyyy");
    pdf.text(formattedDueDate, 522, 202);
    
    // Add blue rectangle background
    pdf.setFillColor(240, 247, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0);
    pdf.rect(297, 125, 585, 241, "F");
    
    // Table Header
    pdf.setFontSize(13);
    pdf.setTextColor(121, 137, 150);
    pdf.text("Services", 49, 272);
    pdf.text("Qty", 290, 273);
    pdf.text("Price", 408, 273);
    pdf.text("Subtotal", 538, 273);
    
    // Table Items
    let currentY = 306;
    const rowHeight = 46;
    
    invoice.items.forEach((item, index) => {
      pdf.setFontSize(13);
      pdf.setTextColor(17, 18, 19);
      pdf.text(item.description, 44, currentY);
      
      pdf.setTextColor(130, 135, 140);
      pdf.text(item.quantity.toString(), 291, currentY);
      pdf.text(`$${item.rate.toFixed(2)}`, 407, currentY - 1);
      
      pdf.setTextColor(17, 18, 19);
      pdf.text(`$${item.amount.toFixed(2)}`, 544, currentY - 2);
      
      currentY += rowHeight;
    });
    
    // Totals Section
    currentY = 507;
    
    // Add subtotal
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subtotal", 399, currentY);
    
    pdf.setTextColor(130, 135, 140);
    pdf.text(`$${invoice.subtotal.toFixed(2)}`, 539, currentY - 2);
    
    // Add discount
    currentY += 27;
    pdf.setTextColor(0, 0, 0);
    pdf.text("Discount", 402, currentY);
    
    pdf.setTextColor(130, 135, 140);
    const discountText = invoice.discountAmount > 0 ? `$${invoice.discountAmount.toFixed(2)}` : "0";
    pdf.text(discountText, 555, currentY - 1);
    
    // Add tax
    currentY += 30;
    pdf.setTextColor(0, 0, 0);
    pdf.text("TAX:", 388, currentY);
    
    pdf.setTextColor(130, 135, 140);
    const taxText = invoice.taxAmount > 0 ? `$${invoice.taxAmount.toFixed(2)}` : "0";
    pdf.text(taxText, 555, currentY - 3);
    
    // Add highlighted total box
    pdf.setFillColor(240, 247, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0);
    pdf.rect(466, 598, 200, 33, "F");
    
    // Add total
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(13);
    pdf.text("Total", 389, 599);
    
    pdf.setFontSize(17);
    pdf.text(`$${invoice.total.toFixed(2)}`, 533, 599);
    
    // Footer section
    // Company logo box
    pdf.setFillColor(240, 247, 255);
    pdf.setDrawColor(59, 130, 246);
    pdf.setLineWidth(0);
    pdf.rect(52, 672, 48, 42, "F");
    
    // Company name
    pdf.setFontSize(17);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Pin Box", 90, 713);
    
    // Company website
    pdf.setFontSize(10);
    pdf.setTextColor(126, 140, 154);
    pdf.text("www.pinbox.io", 77, 738);
    
    // Company email
    pdf.text("support@pinbox.io", 89, 751);
    
    // Notes section
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Notes", 275, 711);
    
    // Notes content
    pdf.setFontSize(10);
    pdf.setTextColor(126, 140, 154);
    const notesText = invoice.notes && invoice.notes.trim().length > 0 
      ? invoice.notes 
      : "No additional notes";
    
    const notesLines = pdf.splitTextToSize(notesText, 120);
    pdf.text(notesLines, 306, 751);
    
    // Terms section
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Terms & Conditions", 444, 711);
    
    // Terms content
    pdf.setFontSize(10);
    pdf.setTextColor(126, 140, 154);
    const termsText = invoice.termsAndConditions && invoice.termsAndConditions.trim().length > 0 
      ? invoice.termsAndConditions 
      : "No terms and conditions specified";
    
    const termsLines = pdf.splitTextToSize(termsText, 120);
    pdf.text(termsLines, 438, 751);
    
    // Save the PDF
    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
