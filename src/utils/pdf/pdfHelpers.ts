
import jsPDF from 'jspdf';
import { PAGE_CONFIG, CONTENT_WIDTH, FONTS, LINE_WIDTH } from './pdfStyles';

/**
 * Checks if content would overflow the page and adds a new page if needed
 */
export const checkPageOverflow = (doc: jsPDF, y: number): number => {
  if (y > (PAGE_CONFIG.height - PAGE_CONFIG.margin.bottom)) {
    doc.addPage();
    return PAGE_CONFIG.margin.top;
  }
  return y;
};

/**
 * Handles wrapping long text and returns the new Y position
 */
export const addWrappedText = (
  doc: jsPDF, 
  text: string, 
  x: number, 
  y: number, 
  maxWidth: number,
  lineHeight: number = 6
): number => {
  const safeText = text || "Not provided";
  const wrappedLines = doc.splitTextToSize(safeText, maxWidth);
  doc.text(wrappedLines, x, y);
  return y + (wrappedLines.length * lineHeight);
};

/**
 * Adds a field with label and value, handling long text wrapping
 */
export const addField = (
  doc: jsPDF, 
  label: string, 
  value: string | null | undefined, 
  x: number,
  y: number, 
  labelWidth: number = 50,
  maxWidth: number = CONTENT_WIDTH - 50
): number => {
  const safeValue = typeof value === 'string' ? value.trim() : (value || "Not provided");
  
  // Add label in bold
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.text(`${label}:`, x, y);
  
  // Reset to normal font for the value
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  
  // Handle long text values
  if (safeValue && safeValue.length > 50) {
    return addWrappedText(doc, safeValue, x + labelWidth, y, maxWidth);
  }
  
  // Handle short text values
  doc.text(safeValue, x + labelWidth, y);
  return y + 9; // Return new Y position with spacing
};

/**
 * Adds a section title with underline
 */
export const addSectionTitle = (doc: jsPDF, text: string, x: number, y: number): number => {
  y = checkPageOverflow(doc, y + 12);
  
  doc.setFont(FONTS.family.main, FONTS.style.bold);
  doc.setFontSize(FONTS.size.heading);
  doc.text(text, x, y);
  
  doc.setLineWidth(LINE_WIDTH.thick);
  doc.line(x, y + 2, PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y + 2);
  
  doc.setFont(FONTS.family.main, FONTS.style.normal);
  doc.setFontSize(FONTS.size.body);
  
  return y + 10;
};

/**
 * Adds a separator line
 */
export const addSeparator = (doc: jsPDF, y: number): number => {
  doc.setLineWidth(LINE_WIDTH.thick);
  doc.line(PAGE_CONFIG.margin.left, y, PAGE_CONFIG.width - PAGE_CONFIG.margin.right, y);
  return y + 7;
};

/**
 * Adds multi-paragraph text with proper formatting and spacing
 */
export const addMultiParagraphText = (
  doc: jsPDF, 
  text: string | null | undefined, 
  x: number, 
  y: number, 
  maxWidth: number = CONTENT_WIDTH
): number => {
  const safeText = typeof text === 'string' ? text.trim() : (text || "Not provided");
  const paragraphs = safeText.split(/\n\n+/);
  
  let currentY = y;
  for (let i = 0; i < paragraphs.length; i++) {
    // Check for page overflow
    currentY = checkPageOverflow(doc, currentY);
    
    // Add space between paragraphs (except for the first one)
    if (i > 0) currentY += 3;
    
    // Wrap and add the paragraph text
    currentY = addWrappedText(doc, paragraphs[i], x, currentY, maxWidth);
  }
  
  return currentY + 5; // Add final spacing
};
