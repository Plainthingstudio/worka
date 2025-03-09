
import jsPDF from 'jspdf';
import { InvoiceItem } from '@/types';
import { PAGE_CONFIG, FONTS, COLORS, LINE_WIDTH, TABLE_CONFIG, CONTENT_WIDTH } from './pdfStyles';
import { checkPageOverflow } from './pdfHelpers';

/**
 * Renders the invoice items table
 */
export const renderInvoiceItems = (
  doc: jsPDF,
  items: InvoiceItem[],
  startY: number
): number => {
  const { margin } = PAGE_CONFIG;
  // Use the passed startY position, but ensure minimum spacing
  let currentY = Math.max(startY + 15, TABLE_CONFIG.header.y);
  
  // Add table headers with proper spacing
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  
  // Table header columns with improved positioning
  doc.text("ITEM DESCRIPTION", TABLE_CONFIG.columns.description.x, currentY);
  doc.text("PRICE", TABLE_CONFIG.columns.price.x, currentY);
  doc.text("QTY", TABLE_CONFIG.columns.quantity.x, currentY);
  doc.text("TOTAL", TABLE_CONFIG.columns.amount.x, currentY, { align: "right" });
  
  // Table header underline
  doc.setDrawColor(...COLORS.line.dark);
  doc.setLineWidth(LINE_WIDTH.thick);
  doc.line(margin.left, currentY + 2, PAGE_CONFIG.width - margin.right, currentY + 2);
  
  // Reset to normal font for table rows
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setFontSize(FONTS.size.body);
  currentY += 10;
  
  // Draw table rows
  items.forEach((item, index) => {
    // Check if we need a new page
    if (currentY > PAGE_CONFIG.height - 50) {
      doc.addPage();
      currentY = 30;
    }
    
    // Handle long item descriptions
    const descriptionWidth = TABLE_CONFIG.columns.description.width;
    const wrappedDescription = doc.splitTextToSize(item.description, descriptionWidth);
    
    // Draw the item's details with proper alignment
    doc.text(wrappedDescription, TABLE_CONFIG.columns.description.x, currentY);
    doc.text(`$${item.rate.toFixed(2)}`, TABLE_CONFIG.columns.price.x, currentY);
    doc.text(item.quantity.toString(), TABLE_CONFIG.columns.quantity.x, currentY);
    doc.text(`$${item.amount.toFixed(2)}`, TABLE_CONFIG.columns.amount.x, currentY, { align: "right" });
    
    // Calculate row height based on description length
    const rowHeight = Math.max(wrappedDescription.length * 6, 12);
    
    // Draw separator line between items (except for the last item)
    if (index < items.length - 1) {
      doc.setDrawColor(...COLORS.line.light);
      doc.setLineWidth(LINE_WIDTH.thin);
      
      const lineY = currentY + rowHeight - 2;
      doc.line(margin.left, lineY, PAGE_CONFIG.width - margin.right, lineY);
    }
    
    currentY += rowHeight + 3;
  });
  
  // Return the final Y position
  return currentY + 5; // Add a little extra spacing
};
