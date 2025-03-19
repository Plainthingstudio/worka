
import jsPDF from 'jspdf';
import { InvoiceItem } from '@/types';
import { PAGE_CONFIG, FONTS, COLORS, TABLE_CONFIG } from './pdfStyles';

/**
 * Renders the invoice items table
 */
export const renderInvoiceItems = (
  doc: jsPDF,
  items: InvoiceItem[],
  startY: number
): number => {
  const { margin } = PAGE_CONFIG;
  
  // Use the predefined table header Y position
  let currentY = TABLE_CONFIG.header.y;
  
  // Add table headers with proper styling
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(...COLORS.text.body);
  
  // Table header columns 
  doc.text("Services", TABLE_CONFIG.columns.description.x, currentY);
  doc.text("Qty", TABLE_CONFIG.columns.quantity.x, currentY);
  doc.text("Price", TABLE_CONFIG.columns.price.x, currentY);
  doc.text("Subtotal", TABLE_CONFIG.columns.amount.x, currentY);
  
  // Light line after headers
  doc.setDrawColor(...COLORS.line.light);
  doc.setLineWidth(0.2);
  doc.line(margin.left, currentY + 5, PAGE_CONFIG.width - margin.right, currentY + 5);
  
  // Reset font for table rows
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setFontSize(FONTS.size.subheading);
  
  currentY += 33; // Start of first row
  
  // Draw table rows
  items.forEach((item, index) => {
    // Check if we need a new page
    if (currentY > PAGE_CONFIG.height - 150) {
      doc.addPage();
      currentY = 50;
    }
    
    // Item description - dark text
    doc.setTextColor(...COLORS.text.dark);
    doc.text(item.description, TABLE_CONFIG.columns.description.x, currentY);
    
    // Quantity - gray text
    doc.setTextColor(...COLORS.text.muted);
    doc.text(item.quantity.toString(), TABLE_CONFIG.columns.quantity.x, currentY);
    
    // Price - gray text
    doc.text(`$${item.rate.toFixed(2)}`, TABLE_CONFIG.columns.price.x, currentY);
    
    // Amount - dark text
    doc.setTextColor(...COLORS.text.dark);
    doc.text(`$${item.amount.toFixed(2)}`, TABLE_CONFIG.columns.amount.x, currentY);
    
    // Add row separator
    if (index < items.length - 1) {
      doc.setDrawColor(...COLORS.line.light);
      doc.setLineWidth(0.1);
      doc.line(margin.left, currentY + 10, PAGE_CONFIG.width - margin.right, currentY + 10);
    }
    
    currentY += TABLE_CONFIG.row.height;
  });
  
  // Return the final Y position
  return currentY + 15;
};
