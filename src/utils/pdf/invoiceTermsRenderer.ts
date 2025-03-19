
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
  
  // Ensure we position the footer at a reasonable position
  let currentY = Math.min(startY + 20, 680);
  
  // Add company logo box
  doc.setFillColor(COLORS.background.highlight[0], COLORS.background.highlight[1], COLORS.background.highlight[2]);
  doc.rect(margin.left, currentY, 60, 60, "F");
  
  // Add company name
  doc.setFontSize(FONTS.size.heading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Pin Box", margin.left, currentY + 80);
  
  // Add company website and email
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  doc.text("www.pinbox.io", margin.left, currentY + 95);
  doc.text("support@pinbox.io", margin.left, currentY + 110);
  
  // Add notes section
  const notesX = 210;
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Notes", notesX, currentY + 15);
  
  // Add notes content
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const notesText = notes && notes.trim().length > 0 
    ? notes 
    : "No additional notes";
  
  const notesLines = doc.splitTextToSize(notesText, 150);
  doc.text(notesLines, notesX, currentY + 30);
  
  // Add terms section
  const termsX = 370;
  doc.setFontSize(FONTS.size.subheading);
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setTextColor(COLORS.text.black[0], COLORS.text.black[1], COLORS.text.black[2]);
  doc.text("Terms & Conditions", termsX, currentY + 15);
  
  // Add terms content
  doc.setFontSize(FONTS.size.small);
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setTextColor(COLORS.text.body[0], COLORS.text.body[1], COLORS.text.body[2]);
  const termsText = termsAndConditions && termsAndConditions.trim().length > 0 
    ? termsAndConditions 
    : "Payment due within 14 days of receipt.";
  
  const termsLines = doc.splitTextToSize(termsText, 150);
  doc.text(termsLines, termsX, currentY + 30);
  
  return currentY;
};
