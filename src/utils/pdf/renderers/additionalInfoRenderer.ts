
import jsPDF from "jspdf";
import { addSectionTitle, checkPageOverflow, addMultiParagraphField } from "../../pdfUtils";

/**
 * Renders the additional information section of the PDF
 */
export const renderAdditionalInformation = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Additional Information", y);
  
  if (brief.brandPositioning || brief.brand_positioning) {
    y = addMultiParagraphField(doc, "Brand Positioning", brief.brandPositioning || brief.brand_positioning, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.barrierToEntry || brief.barrier_to_entry) {
    y = addMultiParagraphField(doc, "Barrier to Entry", brief.barrierToEntry || brief.barrier_to_entry, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.specificImagery || brief.specific_imagery) {
    y = addMultiParagraphField(doc, "Specific Imagery", brief.specificImagery || brief.specific_imagery, y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};
