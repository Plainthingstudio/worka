
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
  
  // Ensure we position the footer at a reasonable position
  let currentY = Math.max(startY + 20, footer.company.name.y - 100);
  
  // Add company logo box
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.rect(logo.x, currentY, logo.width, logo.height, "F");
  
  // Add company name
  doc.setFontSize(FONTS.size.heading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Pin Box", logo.x, currentY + logo.height + 20);
  
  // Add company website
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("www.pinbox.io", logo.x, currentY + logo.height + 35);
  
  // Add company email
  doc.text("support@pinbox.io", logo.x, currentY + logo.height + 50);
  
  // Add notes section
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Notes", margin.left + 190, currentY + logo.height + 20);
  
  // Add notes content
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const notesText = notes && notes.trim().length > 0 
    ? notes 
    : "No additional notes";
  
  const notesLines = doc.splitTextToSize(notesText, 150);
  doc.text(notesLines, margin.left + 190, currentY + logo.height + 35);
  
  // Add terms section
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Terms & Conditions", margin.left + 360, currentY + logo.height + 20);
  
  // Add terms content
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const termsText = termsAndConditions && termsAndConditions.trim().length > 0 
    ? termsAndConditions 
    : "No terms and conditions specified";
  
  const termsLines = doc.splitTextToSize(termsText, 150);
  doc.text(termsLines, margin.left + 360, currentY + logo.height + 35);
  
  return currentY;
};
