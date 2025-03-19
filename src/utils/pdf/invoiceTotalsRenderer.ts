
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
  
  // Set Y position for totals section, ensure proper spacing from previous section
  let currentY = startY + 20;
  
  // Set positions for totals section
  const totalsX = 380;
  const valuesX = PAGE_CONFIG.width - margin.right;
  
  // Add subtotal
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Subtotal", totalsX, currentY);
  
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text(`$${subtotal.toFixed(0)}`, valuesX, currentY, { align: "right" });
  
  currentY += 25;
  
  // Add discount if applicable
  if (discountAmount > 0) {
    doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
    doc.text("Discount", totalsX, currentY);
    
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text(`$${discountAmount.toFixed(0)}`, valuesX, currentY, { align: "right" });
    
    currentY += 25;
  }
  
  // Add tax if applicable
  if (taxAmount > 0) {
    doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
    doc.text(`Tax (${taxPercentage}%)`, totalsX, currentY);
    
    doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
    doc.text(`$${taxAmount.toFixed(0)}`, valuesX, currentY, { align: "right" });
    
    currentY += 25;
  }
  
  // Add highlighted total
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.rect(
    totalsX - 20, 
    currentY - 15, 
    190, 
    30, 
    "F"
  );
  
  // Add total
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.setFontSize(FONTS.size.heading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text("Total", totalsX, currentY);
  
  doc.setFontSize(FONTS.size.subtitle);
  doc.text(`$${total.toFixed(0)}`, valuesX, currentY, { align: "right" });
  
  return currentY + 40;
};
