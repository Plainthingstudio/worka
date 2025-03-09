
import jsPDF from 'jspdf';
import { PAGE_CONFIG, FONTS, CONTENT_WIDTH } from './pdfStyles';
import { addSectionTitle, addMultiParagraphText } from './pdfHelpers';

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
  let currentY = startY + 30; // Add some space after totals
  
  // Add terms and conditions
  if (termsAndConditions) {
    currentY = addSectionTitle(doc, "Terms & Condition", margin.left, currentY);
    currentY = addMultiParagraphText(
      doc, 
      termsAndConditions, 
      margin.left, 
      currentY, 
      CONTENT_WIDTH
    );
  }
  
  // Add notes if available
  if (notes && notes.trim().length > 0) {
    currentY += 15; // Add space between terms and notes
    currentY = addSectionTitle(doc, "Notes", margin.left, currentY);
    currentY = addMultiParagraphText(
      doc, 
      notes, 
      margin.left, 
      currentY, 
      CONTENT_WIDTH
    );
  }
  
  return currentY;
};
