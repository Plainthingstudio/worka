
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';
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
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // Set default font
    doc.setFont("helvetica");
    
    // Document margins
    const margin = {
      left: 50,
      right: 50,
      top: 40
    };
    
    // HEADER SECTION
    // Add "Invoice" title
    doc.setFontSize(27);
    doc.setTextColor(0, 0, 0);
    doc.text("Invoice", margin.left, margin.top);
    
    // Add Invoice number
    doc.setFontSize(12);
    doc.setTextColor(121, 137, 150);
    doc.text("Invoice no:", 500, margin.top);
    
    doc.setFontSize(18);
    doc.setTextColor(25, 34, 41);
    doc.text(invoice.invoiceNumber, 520, margin.top + 23);
    
    // CLIENT SECTION
    const clientSectionY = 120;
    
    // Billed to label
    doc.setFontSize(13);
    doc.setTextColor(121, 137, 150);
    doc.text("Billed to:", margin.left, clientSectionY);
    
    // Client name
    doc.setFontSize(17);
    doc.setTextColor(25, 34, 41);
    doc.text(client.name, margin.left, clientSectionY + 30);
    
    // Client address
    doc.setFontSize(12);
    doc.setTextColor(121, 137, 150);
    const addressText = client.address || "Address not provided";
    doc.text(addressText, margin.left, clientSectionY + 55);
    
    // Add light blue background to right half
    const bgHeight = 230;
    doc.setFillColor(245, 250, 255);
    doc.rect(margin.left + 300, clientSectionY - 10, 245, bgHeight, 'F');
    
    // DATE SECTION
    // Issued date
    doc.setFontSize(12);
    doc.setTextColor(121, 137, 150);
    doc.text("Issued on:", 450, clientSectionY);
    
    doc.setFontSize(13);
    doc.setTextColor(25, 34, 41);
    const formattedIssueDate = format(new Date(invoice.date), "dd MMMM, yyyy");
    doc.text(formattedIssueDate, 450, clientSectionY + 20);
    
    // Due date
    doc.setFontSize(12);
    doc.setTextColor(121, 137, 150);
    doc.text("Payment Due:", 450, clientSectionY + 50);
    
    doc.setFontSize(13);
    doc.setTextColor(25, 34, 41);
    const formattedDueDate = format(new Date(invoice.dueDate), "dd MMMM, yyyy");
    doc.text(formattedDueDate, 450, clientSectionY + 70);
    
    // TABLE HEADER
    const tableStartY = 350;
    
    doc.setFontSize(13);
    doc.setTextColor(121, 137, 150);
    doc.text("Services", margin.left, tableStartY);
    doc.text("Qty", 375, tableStartY);
    doc.text("Price", 450, tableStartY);
    doc.text("Subtotal", 525, tableStartY);
    
    // Light separator line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(margin.left, tableStartY + 10, 545, tableStartY + 10);
    
    // TABLE ITEMS
    let currentY = tableStartY + 40;
    const rowHeight = 40;
    
    // Add table rows with light blue background for even rows
    invoice.items.forEach((item, index) => {
      // Add light background to even rows
      if (index % 2 === 1) {
        doc.setFillColor(245, 250, 255);
        doc.rect(margin.left, currentY - 20, 495, rowHeight, 'F');
      }
      
      doc.setFontSize(13);
      doc.setTextColor(17, 18, 19);
      doc.text(item.description, margin.left, currentY);
      
      doc.setTextColor(130, 135, 140);
      doc.text(item.quantity.toString(), 375, currentY);
      doc.text(`$${item.rate.toFixed(2)}`, 450, currentY);
      
      doc.setTextColor(17, 18, 19);
      doc.text(`$${item.amount.toFixed(2)}`, 525, currentY);
      
      currentY += rowHeight;
    });
    
    // TOTALS SECTION
    const totalsStartY = Math.max(currentY + 30, 660);
    const totalsRightAlign = 545;
    
    // Add subtotal
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("Subtotal", 450, totalsStartY);
    
    doc.setTextColor(130, 135, 140);
    doc.text(`$${invoice.subtotal.toFixed(2)}`, totalsRightAlign, totalsStartY, { align: 'right' });
    
    // Add discount
    doc.setTextColor(0, 0, 0);
    doc.text("Discount", 450, totalsStartY + 30);
    
    doc.setTextColor(130, 135, 140);
    const discountText = invoice.discountAmount > 0 ? `$${invoice.discountAmount.toFixed(2)}` : "0";
    doc.text(discountText, totalsRightAlign, totalsStartY + 30, { align: 'right' });
    
    // Add tax
    doc.setTextColor(0, 0, 0);
    doc.text("TAX:", 450, totalsStartY + 60);
    
    doc.setTextColor(130, 135, 140);
    const taxText = invoice.taxAmount > 0 ? `$${invoice.taxAmount.toFixed(2)}` : "0";
    doc.text(taxText, totalsRightAlign, totalsStartY + 60, { align: 'right' });
    
    // Add total with highlight
    const totalBoxY = totalsStartY + 90;
    doc.setFillColor(245, 250, 255);
    doc.rect(450, totalBoxY - 20, 95, 35, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.text("Total", 450, totalBoxY);
    
    doc.setFontSize(17);
    doc.text(`$${invoice.total.toFixed(2)}`, totalsRightAlign, totalBoxY, { align: 'right' });
    
    // FOOTER SECTION
    const footerY = 780;
    
    // Company logo box
    doc.setFillColor(245, 250, 255);
    doc.rect(margin.left, footerY - 20, 50, 50, 'F');
    
    // Company name
    doc.setFontSize(17);
    doc.setTextColor(0, 0, 0);
    doc.text("Pin Box", margin.left + 60, footerY);
    
    // Company website and email
    doc.setFontSize(10);
    doc.setTextColor(126, 140, 154);
    doc.text("www.pinbox.io", margin.left + 60, footerY + 20);
    doc.text("support@pinbox.io", margin.left + 60, footerY + 35);
    
    // Notes section
    const notesX = 230;
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("Notes", notesX, footerY);
    
    // Notes content
    doc.setFontSize(10);
    doc.setTextColor(126, 140, 154);
    const notesText = invoice.notes && invoice.notes.trim().length > 0 
      ? invoice.notes 
      : "No additional notes";
    
    const notesLines = doc.splitTextToSize(notesText, 120);
    doc.text(notesLines, notesX, footerY + 20);
    
    // Terms section
    const termsX = 390;
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("Terms & Conditions", termsX, footerY);
    
    // Terms content
    doc.setFontSize(10);
    doc.setTextColor(126, 140, 154);
    const termsText = invoice.termsAndConditions && invoice.termsAndConditions.trim().length > 0 
      ? invoice.termsAndConditions 
      : "Payment is due within the specified term. Please make the payment to the specified account.";
    
    const termsLines = doc.splitTextToSize(termsText, 150);
    doc.text(termsLines, termsX, footerY + 20);
    
    // Save the PDF
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
