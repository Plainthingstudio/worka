
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
  let currentY = Math.max(startY + 20, 672); // Ensure we don't start too high
  
  // Add company logo box
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.setDrawColor(COLORS.line.dark[0], COLORS.line.dark[1], COLORS.line.dark[2]);
  doc.setLineWidth(0);
  doc.rect(logo.x, logo.y, logo.width, logo.height, "F");
  
  // Add company name
  doc.setFontSize(FONTS.size.heading);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Pin Box", footer.company.name.x, footer.company.name.y);
  
  // Add company website
  doc.setFontSize(FONTS.size.small);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("www.pinbox.io", footer.company.website.x, footer.company.website.y);
  
  // Add company email
  doc.text("support@pinbox.io", footer.company.email.x, footer.company.email.y);
  
  // Add notes section
  doc.setFontSize(FONTS.size.subheading);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Notes", footer.notes.title.x, footer.notes.title.y);
  
  // Add notes content
  doc.setFontSize(FONTS.size.small);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const notesText = notes && notes.trim().length > 0 
    ? notes 
    : "No additional notes";
  
  const notesLines = doc.splitTextToSize(notesText, 120);
  doc.text(notesLines, footer.notes.content.x, footer.notes.content.y);
  
  // Add terms section
  doc.setFontSize(FONTS.size.subheading);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Terms & Conditions", footer.terms.title.x, footer.terms.title.y);
  
  // Add terms content
  doc.setFontSize(FONTS.size.small);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const termsText = termsAndConditions && termsAndConditions.trim().length > 0 
    ? termsAndConditions 
    : "No terms and conditions specified";
  
  const termsLines = doc.splitTextToSize(termsText, 120);
  doc.text(termsLines, footer.terms.content.x, footer.terms.content.y);
  
  return currentY;
};
