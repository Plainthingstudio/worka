
import jsPDF from "jspdf";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the references section of the PDF
 */
export const renderReferences = (doc: jsPDF, brief: any, y: number): number => {
  if (brief.reference1 || brief.reference2 || brief.reference3 || brief.reference4) {
    y = addSectionTitle(doc, "References", y);
    
    if (brief.reference1) {
      y = addField(doc, "Reference 1", brief.reference1, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.reference2) {
      y = addField(doc, "Reference 2", brief.reference2, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.reference3) {
      y = addField(doc, "Reference 3", brief.reference3, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.reference4) {
      y = addField(doc, "Reference 4", brief.reference4, y);
      y = checkPageOverflow(doc, y);
    }
  }
  
  return y;
};
