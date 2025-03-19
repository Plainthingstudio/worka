
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
  
  // Table header position
  let currentY = startY;
  
  // Add table headers with proper styling
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(...COLORS.text.body);
  
  // Table header columns 
  doc.text("Services", TABLE_CONFIG.columns.description.x, currentY);
  doc.text("Qty", TABLE_CONFIG.columns.quantity.x, currentY);
  doc.text("Price", TABLE_CONFIG.columns.price.x, currentY);
  doc.text("Subtotal", TABLE_CONFIG.columns.amount.x, currentY);
  
  // Light separator line after headers
  doc.setDrawColor(...COLORS.line.light);
  doc.setLineWidth(0.2);
  doc.line(margin.left, currentY + 10, PAGE_CONFIG.width - margin.right, currentY + 10);
  
  // Reset font for table rows
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setFontSize(FONTS.size.subheading);
  
  currentY += 40; // Start of first row with more spacing
  
  // Draw table rows
  items.forEach((item, index) => {
    // Check if we need a new page
    if (currentY > PAGE_CONFIG.height - 150) {
      doc.addPage();
      currentY = 50;
    }
    
    // Add zebra striping (light background for even rows)
    if (index % 2 === 1) {
      doc.setFillColor(...COLORS.background.highlight);
      doc.rect(
        margin.left, 
        currentY - 20, 
        PAGE_CONFIG.width - margin.left - margin.right,
        TABLE_CONFIG.row.height, 
        "F"
      );
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
    
    currentY += TABLE_CONFIG.row.height;
  });
  
  // Return the final Y position
  return currentY + 15;
};
