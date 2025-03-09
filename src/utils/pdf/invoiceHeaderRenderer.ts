
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { PAGE_CONFIG, FONTS } from './pdfStyles';
import { addField } from './pdfHelpers';

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
  let currentY = margin.top;
  
  // Add company name (top left)
  doc.setFontSize(FONTS.size.subtitle);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text("Pin Box", margin.left, currentY + 10);
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.text("Private Limited", margin.left, currentY + 16);
  
  // Add INVOICE header (top right)
  doc.setFontSize(FONTS.size.title);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text("Invoice", PAGE_CONFIG.width - margin.right, currentY + 5, { align: "right" });
  
  // Add invoice details (top right, below INVOICE)
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text("Invoice#:", PAGE_CONFIG.width - margin.right - 55, currentY + 20);
  doc.text("Date:", PAGE_CONFIG.width - margin.right - 55, currentY + 27);
  doc.text("Due Date:", PAGE_CONFIG.width - margin.right - 55, currentY + 34);
  
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.text(invoiceNumber, PAGE_CONFIG.width - margin.right, currentY + 20, { align: "right" });
  doc.text(format(new Date(invoiceDate), "dd/MM/yyyy"), PAGE_CONFIG.width - margin.right, currentY + 27, { align: "right" });
  doc.text(format(new Date(dueDate), "dd/MM/yyyy"), PAGE_CONFIG.width - margin.right, currentY + 34, { align: "right" });
  
  // Add "Total Due:" section
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text("Total Due:", PAGE_CONFIG.width - margin.right, currentY + 47, { align: "right" });
  doc.text(`USD: $ ${total.toFixed(2)}`, PAGE_CONFIG.width - margin.right, currentY + 54, { align: "right" });
  
  // Add billed to section (left) - with clear header
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text("Bill To:", margin.left, currentY + 40);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.text(clientName, margin.left, currentY + 47);
  
  // Handle client address and phone with better wrapping
  let billingY = currentY + 54;
  if (clientAddress) {
    const addressWidth = (PAGE_CONFIG.width - margin.left - margin.right) * 0.45;
    const addressLines = doc.splitTextToSize(clientAddress, addressWidth);
    doc.text(addressLines, margin.left, billingY);
    billingY += addressLines.length * 7;
  } else {
    doc.text("No address provided", margin.left, billingY);
    billingY += 7;
  }
  
  // Add phone number after address
  if (clientPhone) {
    doc.text(clientPhone, margin.left, billingY);
    billingY += 7;
  } else {
    doc.text("No phone provided", margin.left, billingY);
    billingY += 7;
  }
  
  // Return the Y position after the header section (add some padding)
  return billingY;
};
