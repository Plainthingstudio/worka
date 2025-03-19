
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
  
  // Add subtotal
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(...COLORS.text.black);
  doc.text("Subtotal", totals.subtotal.label.x, totals.subtotal.label.y);
  
  doc.setTextColor(...COLORS.text.muted);
  doc.text(`$${subtotal.toFixed(2)}`, totals.subtotal.value.x, totals.subtotal.value.y);
  
  // Add discount
  doc.setTextColor(...COLORS.text.black);
  doc.text("Discount", totals.discount.label.x, totals.discount.label.y);
  
  doc.setTextColor(...COLORS.text.muted);
  const discountText = discountAmount > 0 ? `$${discountAmount.toFixed(2)}` : "0";
  doc.text(discountText, totals.discount.value.x, totals.discount.value.y);
  
  // Add tax
  doc.setTextColor(...COLORS.text.black);
  doc.text("TAX:", totals.tax.label.x, totals.tax.label.y);
  
  doc.setTextColor(...COLORS.text.muted);
  const taxText = taxAmount > 0 ? `$${taxAmount.toFixed(2)}` : "0";
  doc.text(taxText, totals.tax.value.x, totals.tax.value.y);
  
  // Add highlighted total box
  doc.setFillColor(...COLORS.background.highlight);
  doc.setDrawColor(...COLORS.line.dark);
  doc.setLineWidth(0);
  doc.rect(
    totals.total.box.x, 
    totals.total.box.y, 
    totals.total.box.width, 
    totals.total.box.height, 
    "F"
  );
  
  // Add total
  doc.setTextColor(...COLORS.text.black);
  doc.setFontSize(FONTS.size.subheading);
  doc.text("Total", totals.total.label.x, totals.total.label.y);
  
  doc.setFontSize(FONTS.size.heading);
  doc.text(`$${total.toFixed(2)}`, totals.total.value.x, totals.total.value.y);
  
  return totals.total.box.y + totals.total.box.height + 20;
};
