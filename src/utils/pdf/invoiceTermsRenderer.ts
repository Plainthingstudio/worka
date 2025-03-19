
import jsPDF from 'jspdf';
import { PAGE_CONFIG, FONTS, COLORS, INVOICE_BLOCKS } from './pdfStyles';

/**
 * Renders the terms and conditions and notes sections
 */
export const renderTermsAndNotes = (
  doc: jsPDF,
  startY: number,
  termsAndConditions?: string,
  notes?: string
): number => {
  const { margin } = PAGE_CONFIG;
  const { footer, logo } = INVOICE_BLOCKS;
  
  // Ensure footer is positioned correctly
  let currentY = Math.min(startY + 40, 700);
  
  // Add company logo box
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.rect(logo.x, logo.y, logo.width, logo.height, "F");
  
  // Add company name
  doc.setFontSize(FONTS.size.heading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Pin Box", footer.company.name.x, footer.company.name.y);
  
  // Add company website and email - lighter gray text
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("www.pinbox.io", footer.company.website.x, footer.company.website.y);
  doc.text("support@pinbox.io", footer.company.email.x, footer.company.email.y);
  
  // Add notes section
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Notes", footer.notes.title.x, footer.notes.title.y);
  
  // Add notes content - lighter gray text
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const notesText = notes && notes.trim().length > 0 
    ? notes 
    : "No additional notes";
  
  const notesLines = doc.splitTextToSize(notesText, 150);
  doc.text(notesLines, footer.notes.content.x, footer.notes.content.y);
  
  // Add terms section
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Terms & Conditions", footer.terms.title.x, footer.terms.title.y);
  
  // Add terms content - lighter gray text
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const termsText = termsAndConditions && termsAndConditions.trim().length > 0 
    ? termsAndConditions 
    : "Payment due within 14 days of receipt.";
  
  const termsLines = doc.splitTextToSize(termsText, 150);
  doc.text(termsLines, footer.terms.content.x, footer.terms.content.y);
  
  // Add subtle divider line above footer (optional)
  doc.setDrawColor(COLORS.line.light[0], COLORS.line.light[1], COLORS.line.light[2]);
  doc.setLineWidth(0.5);
  doc.line(margin.left, logo.y - 20, PAGE_CONFIG.width - margin.right, logo.y - 20);
  
  return currentY;
};
