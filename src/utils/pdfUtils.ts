
import jsPDF from "jspdf";

// Define consistent page margins for all sides
const PAGE_MARGINS = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 30, // Increased bottom margin to prevent content from being cut off
};

// Document width after applying margins
const CONTENT_WIDTH = 210 - PAGE_MARGINS.left - PAGE_MARGINS.right;

// Helper function to add a section title
export const addSectionTitle = (doc: jsPDF, text: string, y: number) => {
  // Check if we need to add a new page before adding the section title
  y = checkPageOverflow(doc, y + 20); // Add extra space to ensure section title fits
  
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
  
  // Calculate the height this field will take (for page overflow check)
  let estimatedHeight = 12; // Default height for single line
  const valueMaxWidth = CONTENT_WIDTH - 50;
  
  if (safeValue && safeValue.length > 50) {
    const textLines = doc.splitTextToSize(safeValue, valueMaxWidth);
    estimatedHeight = Math.max((textLines.length * 7), 10) + 5;
  }
  
  // Check if we need a new page before adding this field
  if (y + estimatedHeight > (297 - PAGE_MARGINS.bottom)) {
    y = checkPageOverflow(doc, y);
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12); // Set consistent font size
  doc.text(`${label}:`, PAGE_MARGINS.left, y);
  doc.setFont("helvetica", "normal");
  
  // Calculate maximum width available for the text
  const maxWidth = CONTENT_WIDTH; // Full page width minus margins
  const labelWidth = 50; // Space for label
  
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
  
  // Estimate the height this text will take
  const paragraphs = safeValue.split(/\n\n+/);
  const valueMaxWidth = CONTENT_WIDTH - 50;
  
  let estimatedHeight = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    const textLines = doc.splitTextToSize(paragraphs[i], valueMaxWidth);
    estimatedHeight += (textLines.length * 7) + (i > 0 ? 5 : 0);
  }
  estimatedHeight += 8; // Additional spacing
  
  // Check if we need a new page
  if (y + estimatedHeight > (297 - PAGE_MARGINS.bottom)) {
    y = checkPageOverflow(doc, y);
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${label}:`, PAGE_MARGINS.left, y);
  doc.setFont("helvetica", "normal");
  
  // Split into paragraphs first (if there are actual paragraphs)
  let currentY = y;
  
  for (let i = 0; i < paragraphs.length; i++) {
    // For the first paragraph, align with the label
    const xPos = i === 0 ? PAGE_MARGINS.left + 50 : PAGE_MARGINS.left;
    
    // Wrap each paragraph text to fit the page
    const textLines = doc.splitTextToSize(paragraphs[i], valueMaxWidth);
    
    // Check if this paragraph will fit on current page
    if (currentY + (textLines.length * 7) > (297 - PAGE_MARGINS.bottom)) {
      doc.addPage();
      currentY = PAGE_MARGINS.top;
    }
    
    // Add some extra space between paragraphs, but not for the first one
    if (i > 0) currentY += 5;
    
    doc.text(textLines, xPos, currentY);
    currentY += (textLines.length * 7); // Advance based on number of lines
  }
  
  // Return position after all paragraphs with added spacing
  return currentY + 8;
};
