
import jsPDF from "jspdf";

// Helper function to add a section title
export const addSectionTitle = (doc: jsPDF, text: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16); // Increased from 14
  doc.text(text, 20, y);
  doc.setLineWidth(0.8); // Increased from 0.5 for better visibility
  doc.line(20, y + 3, 190, y + 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12); // Increased from 11
  return y + 15; // Increased spacing after section title
};

// Helper function to add a field
export const addField = (doc: jsPDF, label: string, value: string | null | undefined, y: number) => {
  const safeValue = typeof value === 'string' ? value.trim() : (value || "Not provided");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12); // Set consistent font size
  doc.text(`${label}:`, 20, y);
  doc.setFont("helvetica", "normal");
  
  // Calculate maximum width available for the text
  const maxWidth = 170; // Full page width minus margins
  const labelWidth = 50; // Space for label
  const valueMaxWidth = maxWidth - labelWidth;
  
  // Check if we need to wrap text
  if (safeValue && safeValue.length > 50) { // Reduced threshold for wrapping
    const textLines = doc.splitTextToSize(safeValue, valueMaxWidth);
    doc.text(textLines, 70, y);
    
    // Calculate vertical space needed based on number of lines
    // Add a minimum space of 10 points between fields
    return y + Math.max((textLines.length * 7), 10) + 5;
  } else {
    doc.text(safeValue, 70, y);
    return y + 12; // Increased from 8 for better spacing between single line fields
  }
};

// Helper function to check page overflow and add a new page if needed
export const checkPageOverflow = (doc: jsPDF, y: number, margin: number = 20) => {
  if (y > 270) { // Increased from 250 to allow more content per page
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
  doc.line(20, y, 190, y);
  return y + 10; // Return position after separator with added spacing
};

// Helper function to properly format multi-paragraph text
export const addMultiParagraphField = (doc: jsPDF, label: string, value: string | null | undefined, y: number) => {
  const safeValue = typeof value === 'string' ? value.trim() : (value || "Not provided");
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${label}:`, 20, y);
  doc.setFont("helvetica", "normal");
  
  // Split into paragraphs first (if there are actual paragraphs)
  const paragraphs = safeValue.split(/\n\n+/);
  let currentY = y;
  
  // Maximum width for text
  const valueMaxWidth = 120;
  
  for (let i = 0; i < paragraphs.length; i++) {
    // For the first paragraph, align with the label
    const xPos = i === 0 ? 70 : 20;
    
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
