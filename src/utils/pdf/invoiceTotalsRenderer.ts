
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
  const { totals } = INVOICE_BLOCKS;
  const { margin } = PAGE_CONFIG;
  
  // Set Y position for totals section, either use startY or fixed position if startY is too small
  let currentY = Math.max(startY, totals.subtotal.label.y - 50);
  
  // Add subtotal
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Subtotal", totals.subtotal.label.x, currentY);
  
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  doc.text(`$${subtotal.toFixed(0)}`, totals.subtotal.value.x, currentY, { align: "right" });
  
  currentY += 30;
  
  // Add discount if applicable
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Discount", totals.discount.label.x, currentY);
  
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  const discountText = discountAmount > 0 ? `$${discountAmount.toFixed(0)}` : "0";
  doc.text(discountText, totals.discount.value.x, currentY, { align: "right" });
  
  currentY += 30;
  
  // Add tax if applicable
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("TAX:", totals.tax.label.x, currentY);
  
  doc.setTextColor(COLORS.text.dark[0], COLORS.text.dark[1], COLORS.text.dark[2]);
  const taxText = taxAmount > 0 ? `$${taxAmount.toFixed(0)}` : "0";
  doc.text(taxText, totals.tax.value.x, currentY, { align: "right" });
  
  currentY += 40;
  
  // Add highlighted total box
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.rect(
    totals.total.box.x, 
    currentY - 15, 
    totals.total.box.width, 
    totals.total.box.height, 
    "F"
  );
  
  // Add total
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.setFontSize(FONTS.size.subheading);
  doc.text("Total", totals.total.label.x, currentY);
  
  doc.setFontSize(FONTS.size.heading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text(`$${total.toFixed(0)}`, totals.total.value.x, currentY, { align: "right" });
  
  return currentY + totals.total.box.height + 20;
};
