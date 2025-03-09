
import jsPDF from 'jspdf';
import { PAGE_CONFIG, FONTS, LINE_WIDTH } from './pdfStyles';

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
  let currentY = startY + 5;
  
  // Draw line before totals
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(LINE_WIDTH.thick);
  doc.line(margin.left, currentY, PAGE_CONFIG.width - margin.right, currentY);
  currentY += 10;
  
  // Add totals section
  const totalsX = PAGE_CONFIG.width - margin.right - 70;
  const valuesX = PAGE_CONFIG.width - margin.right;
  
  doc.setFontSize(FONTS.size.subheading);
  
  // Subtotal
  doc.text("SUB TOTAL", totalsX, currentY);
  doc.text(`$${subtotal.toFixed(2)}`, valuesX, currentY, { align: "right" });
  currentY += 8;
  
  // Tax
  doc.text(`Tax Vat ${taxPercentage}%`, totalsX, currentY);
  doc.text(`$${taxAmount.toFixed(2)}`, valuesX, currentY, { align: "right" });
  currentY += 8;
  
  // Discount
  doc.text(`Discount ${discountPercentage}%`, totalsX, currentY);
  doc.text(`- $${discountAmount.toFixed(2)}`, valuesX, currentY, { align: "right" });
  currentY += 8;
  
  // Draw line before grand total
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(LINE_WIDTH.thick);
  doc.line(totalsX - 20, currentY, valuesX, currentY);
  currentY += 10;
  
  // Grand total
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setFontSize(FONTS.size.heading);
  doc.text("Grand Total", totalsX, currentY);
  doc.text(`$${total.toFixed(2)}`, valuesX, currentY, { align: "right" });
  
  return currentY + 10;
};
