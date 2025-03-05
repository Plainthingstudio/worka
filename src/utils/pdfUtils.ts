
import jsPDF from "jspdf";

// Helper function to add a section title
export const addSectionTitle = (doc: jsPDF, text: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(text, 20, y);
  doc.setLineWidth(0.5);
  doc.line(20, y + 2, 190, y + 2);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  return y + 12;
};

// Helper function to add a field
export const addField = (doc: jsPDF, label: string, value: string | null | undefined, y: number) => {
  const safeValue = typeof value === 'string' ? value.trim() : (value || "Not provided");
  
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, 20, y);
  doc.setFont("helvetica", "normal");
  
  // Check if we need to wrap text
  if (safeValue && safeValue.length > 70) {
    const textLines = doc.splitTextToSize(safeValue, 140);
    doc.text(textLines, 70, y);
    return y + (textLines.length * 6) + 2;
  } else {
    doc.text(safeValue, 70, y);
    return y + 8;
  }
};

// Helper function to check page overflow and add a new page if needed
export const checkPageOverflow = (doc: jsPDF, y: number, margin: number = 20) => {
  if (y > 250) {
    doc.addPage();
    return margin;
  }
  return y;
};

// Helper function to add a PDF title
export const addPdfTitle = (doc: jsPDF, title: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 105, y, { align: "center" });
  return y + 20;
};
