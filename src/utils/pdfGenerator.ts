
import jsPDF from 'jspdf';
import { Invoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { COLORS, FONTS, PAGE_CONFIG, POSITIONS } from './pdf/pdfStyles';

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
    
    // Add blue background rectangle
    doc.setFillColor(...COLORS.background.highlight);
    doc.setDrawColor(...COLORS.accent.blue);
    doc.setLineWidth(0);
    doc.rect(
      POSITIONS.blueRectangle.x, 
      POSITIONS.blueRectangle.y, 
      POSITIONS.blueRectangle.width, 
      POSITIONS.blueRectangle.height, 
      "F"
    );
    
    // INVOICE HEADER
    // Add "Invoice" title
    doc.setFontSize(FONTS.size.title);
    doc.setTextColor(...COLORS.text.black);
    doc.text("Invoice", POSITIONS.invoice.title.x, POSITIONS.invoice.title.y);
    
    // Add Invoice number label
    doc.setFontSize(FONTS.size.body);
    doc.setTextColor(...COLORS.text.body);
    doc.text("Invoice no:", POSITIONS.invoice.numberLabel.x, POSITIONS.invoice.numberLabel.y);
    
    // Add Invoice number value
    doc.setFontSize(FONTS.size.subtitle);
    doc.setTextColor(...COLORS.text.dark);
    doc.text(invoice.invoiceNumber, POSITIONS.invoice.numberValue.x, POSITIONS.invoice.numberValue.y);
    
    // CLIENT SECTION
    // Add "Billed to" label
    doc.setFontSize(FONTS.size.subheading);
    doc.setTextColor(...COLORS.text.body);
    doc.text("Billed to:", POSITIONS.client.billToLabel.x, POSITIONS.client.billToLabel.y);
    
    // Add client name
    doc.setFontSize(FONTS.size.heading);
    doc.setTextColor(...COLORS.text.dark);
    doc.text(client.name, POSITIONS.client.name.x, POSITIONS.client.name.y);
    
    // Add client address
    doc.setFontSize(FONTS.size.body);
    doc.setTextColor(...COLORS.text.body);
    const addressText = client.address || "Address not provided";
    doc.text(addressText, POSITIONS.client.address.x, POSITIONS.client.address.y);
    
    // DATES SECTION
    // Issued date label
    doc.setFontSize(FONTS.size.body);
    doc.setTextColor(...COLORS.text.body);
    doc.text("Issued on:", POSITIONS.dates.issuedLabel.x, POSITIONS.dates.issuedLabel.y);
    
    // Issued date value
    doc.setFontSize(FONTS.size.subheading);
    doc.setTextColor(...COLORS.text.dark);
    const formattedIssueDate = format(new Date(invoice.date), "dd MMMM, yyyy");
    doc.text(formattedIssueDate, POSITIONS.dates.issuedValue.x, POSITIONS.dates.issuedValue.y);
    
    // Due date label
    doc.setFontSize(FONTS.size.body);
    doc.setTextColor(...COLORS.text.body);
    doc.text("Payment Due:", POSITIONS.dates.dueLabel.x, POSITIONS.dates.dueLabel.y);
    
    // Due date value
    doc.setFontSize(FONTS.size.subheading);
    doc.setTextColor(...COLORS.text.dark);
    const formattedDueDate = format(new Date(invoice.dueDate), "dd MMMM, yyyy");
    doc.text(formattedDueDate, POSITIONS.dates.dueValue.x, POSITIONS.dates.dueValue.y);
    
    // TABLE HEADER
    doc.setFontSize(FONTS.size.subheading);
    doc.setTextColor(...COLORS.text.body);
    doc.text("Services", POSITIONS.tableHeader.services.x, POSITIONS.tableHeader.services.y);
    doc.text("Qty", POSITIONS.tableHeader.qty.x, POSITIONS.tableHeader.qty.y);
    doc.text("Price", POSITIONS.tableHeader.price.x, POSITIONS.tableHeader.price.y);
    doc.text("Subtotal", POSITIONS.tableHeader.subtotal.x, POSITIONS.tableHeader.subtotal.y);
    
    // Light separator line
    doc.setDrawColor(...COLORS.accent.lightGray);
    doc.setLineWidth(0.5);
    doc.line(PAGE_CONFIG.margin.left, POSITIONS.tableHeader.services.y + 10, 545, POSITIONS.tableHeader.services.y + 10);
    
    // TABLE ITEMS
    let currentY = POSITIONS.item.description.y;
    const rowHeight = 46;
    
    invoice.items.forEach((item, index) => {
      // Add description (dark text)
      doc.setFontSize(FONTS.size.subheading);
      doc.setTextColor(...COLORS.text.dark);
      doc.text(item.description, POSITIONS.item.description.x, currentY);
      
      // Add quantity (muted text)
      doc.setTextColor(...COLORS.text.muted);
      doc.text(item.quantity.toString(), POSITIONS.item.quantity.x, currentY);
      
      // Add price (muted text)
      doc.text(`$${item.rate.toFixed(2)}`, POSITIONS.item.price.x, currentY);
      
      // Add amount (dark text)
      doc.setTextColor(...COLORS.text.dark);
      doc.text(`$${item.amount.toFixed(2)}`, POSITIONS.item.amount.x, currentY);
      
      currentY += rowHeight;
    });
    
    // TOTALS SECTION
    // Add subtotal
    doc.setFontSize(FONTS.size.subheading);
    doc.setTextColor(...COLORS.text.black);
    doc.text("Subtotal", POSITIONS.totals.subtotalLabel.x, POSITIONS.totals.subtotalLabel.y);
    
    doc.setTextColor(...COLORS.text.muted);
    doc.text(`$${invoice.subtotal.toFixed(2)}`, POSITIONS.totals.subtotalValue.x, POSITIONS.totals.subtotalValue.y);
    
    // Add discount
    doc.setTextColor(...COLORS.text.black);
    doc.text("Discount", POSITIONS.totals.discountLabel.x, POSITIONS.totals.discountLabel.y);
    
    doc.setTextColor(...COLORS.text.muted);
    const discountText = invoice.discountAmount > 0 ? `$${invoice.discountAmount.toFixed(2)}` : "0";
    doc.text(discountText, POSITIONS.totals.discountValue.x, POSITIONS.totals.discountValue.y);
    
    // Add tax
    doc.setTextColor(...COLORS.text.black);
    doc.text("TAX:", POSITIONS.totals.taxLabel.x, POSITIONS.totals.taxLabel.y);
    
    doc.setTextColor(...COLORS.text.muted);
    const taxText = invoice.taxAmount > 0 ? `$${invoice.taxAmount.toFixed(2)}` : "0";
    doc.text(taxText, POSITIONS.totals.taxValue.x, POSITIONS.totals.taxValue.y);
    
    // Add total with highlight box
    doc.setFillColor(...COLORS.background.highlight);
    doc.rect(
      POSITIONS.totals.totalBox.x, 
      POSITIONS.totals.totalBox.y, 
      POSITIONS.totals.totalBox.width, 
      POSITIONS.totals.totalBox.height, 
      "F"
    );
    
    doc.setTextColor(...COLORS.text.black);
    doc.setFontSize(FONTS.size.subheading);
    doc.text("Total", POSITIONS.totals.totalLabel.x, POSITIONS.totals.totalLabel.y);
    
    doc.setFontSize(FONTS.size.heading);
    doc.text(`$${invoice.total.toFixed(2)}`, POSITIONS.totals.totalValue.x, POSITIONS.totals.totalValue.y);
    
    // FOOTER SECTION
    // Company logo box
    doc.setFillColor(...COLORS.background.highlight);
    doc.rect(
      POSITIONS.footer.companyBox.x, 
      POSITIONS.footer.companyBox.y, 
      POSITIONS.footer.companyBox.width, 
      POSITIONS.footer.companyBox.height, 
      "F"
    );
    
    // Company name
    doc.setFontSize(FONTS.size.heading);
    doc.setTextColor(...COLORS.text.black);
    doc.text("Pin Box", POSITIONS.footer.companyName.x, POSITIONS.footer.companyName.y);
    
    // Company website
    doc.setFontSize(FONTS.size.small);
    doc.setTextColor(...COLORS.text.body);
    doc.text("www.pinbox.io", POSITIONS.footer.companyWebsite.x, POSITIONS.footer.companyWebsite.y);
    
    // Company email
    doc.text("support@pinbox.io", POSITIONS.footer.companyEmail.x, POSITIONS.footer.companyEmail.y);
    
    // Notes section
    doc.setFontSize(FONTS.size.subheading);
    doc.setTextColor(...COLORS.text.black);
    doc.text("Notes", POSITIONS.footer.notesTitle.x, POSITIONS.footer.notesTitle.y);
    
    // Notes content
    doc.setFontSize(FONTS.size.small);
    doc.setTextColor(...COLORS.text.body);
    const notesText = invoice.notes || "No additional notes";
    const notesLines = doc.splitTextToSize(notesText, 120);
    doc.text(notesLines, POSITIONS.footer.notesContent.x, POSITIONS.footer.notesContent.y);
    
    // Terms section
    doc.setFontSize(FONTS.size.subheading);
    doc.setTextColor(...COLORS.text.black);
    doc.text("Terms & Conditions", POSITIONS.footer.termsTitle.x, POSITIONS.footer.termsTitle.y);
    
    // Terms content
    doc.setFontSize(FONTS.size.small);
    doc.setTextColor(...COLORS.text.body);
    const termsText = invoice.termsAndConditions || "Payment is due within the specified term.";
    const termsLines = doc.splitTextToSize(termsText, 120);
    doc.text(termsLines, POSITIONS.footer.termsContent.x, POSITIONS.footer.termsContent.y);
    
    // Save the PDF
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};
