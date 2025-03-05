
import jsPDF from "jspdf";

// Define consistent page margins for all sides
const PAGE_MARGINS = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 20,
};

// Document width after applying margins
const CONTENT_WIDTH = 210 - PAGE_MARGINS.left - PAGE_MARGINS.right;

// Helper function to add a section title
export const addSectionTitle = (doc: jsPDF, text: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16); // Increased from 14
  doc.text(text, PAGE_MARGINS.left, y);
  doc.setLineWidth(0.8); // Increased from 0.5 for better visibility
  doc.line(PAGE_MARGINS.left, y + 3, 210 - PAGE_MARGINS.right, y + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12); // Increased from 11
  return y + 15; // Increased spacing after section title
};

// Helper function to add a field
export const addField = (doc: jsPDF, label: string, value: string | null | undefined, y: number) => {
  const safeValue = typeof value === 'string' ? value.trim() : (value || "Not provided");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12); // Set consistent font size
  doc.text(`${label}:`, PAGE_MARGINS.left, y);
  doc.setFont("helvetica", "normal");
  
  // Calculate maximum width available for the text
  const maxWidth = CONTENT_WIDTH; // Full page width minus margins
  const labelWidth = 50; // Space for label
  const valueMaxWidth = maxWidth - labelWidth;
  
  // Check if we need to wrap text
  if (safeValue && safeValue.length > 50) { // Reduced threshold for wrapping
    const textLines = doc.splitTextToSize(safeValue, valueMaxWidth);
    doc.text(textLines, PAGE_MARGINS.left + 50, y);
    
    // Calculate vertical space needed based on number of lines
    // Add a minimum space of 10 points between fields
    return y + Math.max((textLines.length * 7), 10) + 5;
  } else {
    doc.text(safeValue, PAGE_MARGINS.left + 50, y);
    return y + 12; // Increased from 8 for better spacing between single line fields
  }
};

// Helper function to check page overflow and add a new page if needed
export const checkPageOverflow = (doc: jsPDF, y: number, margin: number = PAGE_MARGINS.top) => {
  if (y > (297 - PAGE_MARGINS.bottom)) { // A4 height (297mm) minus bottom margin
    doc.addPage();
    return margin;
  }
  return y;
};

// Helper function to add a PDF title
export const addPdfTitle = (doc: jsPDF, title: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22); // Increased from 20
  doc.text(title, 105, y, { align: "center" });
  return y + 25; // Increased spacing after title
};

// Helper function to add a separator line
export const addSeparator = (doc: jsPDF, y: number) => {
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGINS.left, y, 210 - PAGE_MARGINS.right, y);
  return y + 10; // Return position after separator with added spacing
};

// Helper function to properly format multi-paragraph text
export const addMultiParagraphField = (doc: jsPDF, label: string, value: string | null | undefined, y: number) => {
  const safeValue = typeof value === 'string' ? value.trim() : (value || "Not provided");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${label}:`, PAGE_MARGINS.left, y);
  doc.setFont("helvetica", "normal");
  
  // Split into paragraphs first (if there are actual paragraphs)
  const paragraphs = safeValue.split(/\n\n+/);
  let currentY = y;
  
  // Maximum width for text
  const valueMaxWidth = CONTENT_WIDTH - 50;
  
  for (let i = 0; i < paragraphs.length; i++) {
    // For the first paragraph, align with the label
    const xPos = i === 0 ? PAGE_MARGINS.left + 50 : PAGE_MARGINS.left;
    
    // Wrap each paragraph text to fit the page
    const textLines = doc.splitTextToSize(paragraphs[i], valueMaxWidth);
    
    // Add some extra space between paragraphs, but not for the first one
    if (i > 0) currentY += 5;
    
    doc.text(textLines, xPos, currentY);
    currentY += (textLines.length * 7); // Advance based on number of lines
  }
  
  // Return position after all paragraphs with added spacing
  return currentY + 8;
};
