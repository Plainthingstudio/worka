
import jsPDF from 'jspdf';
import { PAGE_CONFIG, FONTS, COLORS, INVOICE_BLOCKS } from './pdfStyles';

/**
 * Renders the invoice totals section
 */
export const renderInvoiceTotals = (
  doc: jsPDF,
  startY: number,
  subtotal: number,
  taxPercentage: number,
  taxAmount: number,
  discountPercentage: number,
  discountAmount: number,
  total: number
): number => {
  const { margin } = PAGE_CONFIG;
  const { totals } = INVOICE_BLOCKS;
  
  // Set Y position for totals section, ensure proper spacing from previous section
  let currentY = startY + 10; // Reduced spacing
  
  // Set positions for totals section - adjusted to right align like reference
  const totalsX = 430;
  const valuesX = PAGE_CONFIG.width - margin.right;
  
  // Add subtotal
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text("Subtotal", totalsX, currentY);
  
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text(`$${subtotal.toLocaleString()}`, valuesX, currentY, { align: "right" });
  
  currentY += 25;
  
  // Add discount if applicable
  if (discountAmount > 0) {
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text("Discount", totalsX, currentY);
    
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text(`$${discountAmount.toLocaleString()}`, valuesX, currentY, { align: "right" });
    
    currentY += 25;
  } else {
    // Show 0 discount like in reference
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text("Discount", totalsX, currentY);
    
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text("0", valuesX, currentY, { align: "right" });
    
    currentY += 25;
  }
  
  // Add tax if applicable
  if (taxAmount > 0) {
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text(`TAX:`, totalsX, currentY);
    
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text(`$${taxAmount.toLocaleString()}`, valuesX, currentY, { align: "right" });
    
    currentY += 25;
  } else {
    // Show 0 tax like in reference
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text("TAX:", totalsX, currentY);
    
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text("0", valuesX, currentY, { align: "right" });
    
    currentY += 25;
  }
  
  // Add highlighted total with light blue background
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.rect(
    totals.total.box.x, 
    currentY - 15, 
    totals.total.box.width, 
    totals.total.box.height, 
    "F"
  );
  
  // Add total label
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.setFontSize(FONTS.size.heading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text("Total", totalsX, currentY);
  
  // Add total value
  doc.setFontSize(FONTS.size.heading);
  doc.text(`$${total.toLocaleString()}`, valuesX, currentY, { align: "right" });
  
  return currentY + 40; // Reduced spacing
};
