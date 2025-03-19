
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { PAGE_CONFIG, FONTS, COLORS, INVOICE_BLOCKS } from './pdfStyles';

/**
 * Renders the invoice header section including company info, invoice details, and bill-to section
 */
export const renderInvoiceHeader = (
  doc: jsPDF, 
  invoiceNumber: string,
  invoiceDate: Date,
  dueDate: Date,
  total: number,
  clientName: string,
  clientAddress?: string,
  clientPhone?: string
): number => {
  const { margin } = PAGE_CONFIG;
  const { invoice, client } = INVOICE_BLOCKS;
  
  // Add blue rectangle behind client info
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.setDrawColor(COLORS.accent.blue[0], COLORS.accent.blue[1], COLORS.accent.blue[2]);
  doc.setLineWidth(0);
  doc.rect(297, 125, 595 - 2*margin.left, 241, "F");
  
  // Add "Invoice" title (top left)
  doc.setFontSize(FONTS.size.title);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Invoice", invoice.title.x, invoice.title.y);
  
  // Add invoice number details (top right)
  doc.setFontSize(FONTS.size.body);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("Invoice no:", invoice.number.label.x, invoice.number.label.y);
  
  doc.setFontSize(FONTS.size.subtitle);
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text(invoiceNumber, invoice.number.value.x, invoice.number.value.y);
  
  // Add "Billed to:" section (left)
  doc.setFontSize(FONTS.size.subheading);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("Billed to:", client.label.x, client.label.y);
  
  // Add client name
  doc.setFontSize(FONTS.size.heading);
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text(clientName, client.name.x, client.name.y);
  
  // Add client address and contact info
  doc.setFontSize(FONTS.size.body);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  
  // Build address text with any available info
  let addressText = clientAddress || "No address provided";
  if (clientPhone) {
    addressText += "\n" + clientPhone;
  }
  
  doc.text(addressText, client.address.x, client.address.y);
  
  // Add invoice date details
  doc.setFontSize(FONTS.size.body);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("Issued on:", invoice.date.label.x, invoice.date.label.y);
  
  doc.setFontSize(FONTS.size.subheading);
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text(format(new Date(invoiceDate), "dd MMMM, yyyy"), invoice.date.value.x, invoice.date.value.y);
  
  // Add due date details
  doc.setFontSize(FONTS.size.body);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("Payment Due:", invoice.due.label.x, invoice.due.label.y);
  
  doc.setFontSize(FONTS.size.subheading);
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text(format(new Date(dueDate), "dd MMMM, yyyy"), invoice.due.value.x, invoice.due.value.y);
  
  // Return the Y position after the client info section
  return 375; // After the blue rectangle
};
