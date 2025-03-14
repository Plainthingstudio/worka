
import jsPDF from "jspdf";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the competitors section of the PDF
 */
export const renderCompetitors = (doc: jsPDF, brief: any, y: number): number => {
  if (brief.competitor1 || brief.competitor2 || brief.competitor3 || brief.competitor4) {
    y = addSectionTitle(doc, "Competitors", y);
    
    if (brief.competitor1) {
      y = addField(doc, "Competitor 1", brief.competitor1, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.competitor2) {
      y = addField(doc, "Competitor 2", brief.competitor2, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.competitor3) {
      y = addField(doc, "Competitor 3", brief.competitor3, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.competitor4) {
      y = addField(doc, "Competitor 4", brief.competitor4, y);
      y = checkPageOverflow(doc, y);
    }
  }
  
  return y;
};
