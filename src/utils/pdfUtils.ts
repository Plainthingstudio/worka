
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

// Define consistent page margins for all sides
const PAGE_MARGINS = {
  left: 20,
  right: 20,
  top: 15,  // Reduced from 20
  bottom: 20, // Reduced from 30
};

// Document width after applying margins
const CONTENT_WIDTH = 210 - PAGE_MARGINS.left - PAGE_MARGINS.right;

// Helper function to ensure text is a string
const ensureString = (text: any): string => {
  if (text === null || text === undefined) {
    return "Not provided";
  }
  
  if (Array.isArray(text)) {
    return text.join(", ");
  }
  
  if (typeof text === 'object') {
    return JSON.stringify(text);
  }
  
  return String(text);
};

// Helper function to add a section title
export const addSectionTitle = (doc: jsPDF, text: string, y: number) => {
  // Check if we need to add a new page before adding the section title
  y = checkPageOverflow(doc, y + 12); // Reduced from 20
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14); // Reduced from 16
  doc.text(ensureString(text), PAGE_MARGINS.left, y);
  doc.setLineWidth(0.6); // Reduced from 0.8
  doc.line(PAGE_MARGINS.left, y + 2, 210 - PAGE_MARGINS.right, y + 2); // Reduced from y + 3
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11); // Reduced from 12
  return y + 10; // Reduced from 15
};

// Helper function to add a field
export const addField = (doc: jsPDF, label: string, value: any, y: number) => {
  const safeValue = ensureString(value).trim() || "Not provided";
  
  // Calculate the height this field will take (for page overflow check)
  let estimatedHeight = 9; // Reduced from 12
  const valueMaxWidth = CONTENT_WIDTH - 50;
  
  if (safeValue && safeValue.length > 50) {
    const textLines = doc.splitTextToSize(safeValue, valueMaxWidth);
    estimatedHeight = Math.max((textLines.length * 6), 8) + 3; // Reduced from (textLines.length * 7), 10) + 5
  }
  
  // Check if we need a new page before adding this field
  if (y + estimatedHeight > (297 - PAGE_MARGINS.bottom)) {
    y = checkPageOverflow(doc, y);
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11); // Reduced from 12
  doc.text(`${ensureString(label)}:`, PAGE_MARGINS.left, y);
  doc.setFont("helvetica", "normal");
  
  // Calculate maximum width available for the text
  const maxWidth = CONTENT_WIDTH; // Full page width minus margins
  const labelWidth = 50; // Space for label
  
  // Check if we need to wrap text
  if (safeValue && safeValue.length > 50) { // Reduced threshold for wrapping
    const textLines = doc.splitTextToSize(safeValue, valueMaxWidth);
    doc.text(textLines, PAGE_MARGINS.left + 50, y);
    
    // Calculate vertical space needed based on number of lines
    // Add a minimum space between fields
    return y + Math.max((textLines.length * 6), 8) + 3; // Reduced from (textLines.length * 7), 10) + 5
  } else {
    doc.text(safeValue, PAGE_MARGINS.left + 50, y);
    return y + 9; // Reduced from 12
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
  doc.setFontSize(18); // Reduced from 22
  doc.text(ensureString(title), 105, y, { align: "center" });
  return y + 18; // Reduced from 25
};

// Helper function to add a separator line
export const addSeparator = (doc: jsPDF, y: number) => {
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGINS.left, y, 210 - PAGE_MARGINS.right, y);
  return y + 7; // Reduced from 10
};

// Helper function to properly format multi-paragraph text
export const addMultiParagraphField = (doc: jsPDF, label: string, value: any, y: number) => {
  const safeValue = ensureString(value).trim() || "Not provided";
  
  // Estimate the height this text will take
  const paragraphs = safeValue.split(/\n\n+/);
  const valueMaxWidth = CONTENT_WIDTH - 50;
  
  let estimatedHeight = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    const textLines = doc.splitTextToSize(paragraphs[i], valueMaxWidth);
    estimatedHeight += (textLines.length * 6) + (i > 0 ? 3 : 0); // Reduced from (textLines.length * 7) + (i > 0 ? 5 : 0)
  }
  estimatedHeight += 5; // Reduced from 8
  
  // Check if we need a new page
  if (y + estimatedHeight > (297 - PAGE_MARGINS.bottom)) {
    y = checkPageOverflow(doc, y);
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11); // Reduced from 12
  doc.text(`${ensureString(label)}:`, PAGE_MARGINS.left, y);
  doc.setFont("helvetica", "normal");
  
  // Split into paragraphs first (if there are actual paragraphs)
  let currentY = y;
  
  for (let i = 0; i < paragraphs.length; i++) {
    // For the first paragraph, align with the label
    const xPos = i === 0 ? PAGE_MARGINS.left + 50 : PAGE_MARGINS.left;
    
    // Wrap each paragraph text to fit the page
    const textLines = doc.splitTextToSize(paragraphs[i], valueMaxWidth);
    
    // Check if this paragraph will fit on current page
    if (currentY + (textLines.length * 6) > (297 - PAGE_MARGINS.bottom)) { // Reduced from (textLines.length * 7)
      doc.addPage();
      currentY = PAGE_MARGINS.top;
    }
    
    // Add some extra space between paragraphs, but not for the first one
    if (i > 0) currentY += 3; // Reduced from 5
    
    doc.text(textLines, xPos, currentY);
    currentY += (textLines.length * 6); // Reduced from (textLines.length * 7)
  }
  
  // Return position after all paragraphs with added spacing
  return currentY + 5; // Reduced from 8
};

// Helper function to add a table to the document
export const addTableToDocument = (doc: jsPDF, headers: string[], data: string[][], startY: number): number => {
  if (typeof (doc as any).autoTable !== 'function') {
    console.error("autoTable is not available. Make sure jspdf-autotable is properly imported");
    return startY + 10;
  }
  
  try {
    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: startY,
      theme: 'striped',
      headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { overflow: 'linebreak', fontSize: 10 },
      columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 'auto' } },
    });

    // Get the final Y position
    const finalY = (doc as any).lastAutoTable?.finalY || startY;
    return finalY + 10;
  } catch (error) {
    console.error("Error creating table:", error);
    return startY + 10;
  }
};
