
import jsPDF from "jspdf";
import { 
  renderClientAndBriefInfo,
  renderCompanyInformation,
  renderLogoPreferences,
  renderTargetAudience,
  renderProductInformation,
  renderCompetitors,
  renderReferences,
  renderAdditionalInformation,
  renderServicesRequired
} from "./pdf/graphicDesignBriefRenderer";
import { addPdfTitle } from "./pdfUtils";

/**
 * Generates a PDF document for a graphic design brief
 */
export const generateGraphicDesignBriefPDF = async (brief: any) => {
  try {
    // Log the incoming brief data for debugging
    console.log("Generating PDF with brief data:", brief);
    console.log("Logo feelings data for PDF:", brief.logoFeelings || brief.logo_feelings);
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "Graphic Design Brief", y);

    // Render all sections of the PDF using the specialized renderer functions
    y = renderClientAndBriefInfo(doc, brief, y);
    y = renderCompanyInformation(doc, brief, y);
    y = renderLogoPreferences(doc, brief, y);
    y = renderTargetAudience(doc, brief, y);
    y = renderProductInformation(doc, brief, y);
    y = renderCompetitors(doc, brief, y);
    y = renderReferences(doc, brief, y);
    y = renderAdditionalInformation(doc, brief, y);
    y = renderServicesRequired(doc, brief, y);

    // Save the PDF
    doc.save(`Graphic_Design_Brief_${brief.id}.pdf`);
    console.log("PDF saved successfully for graphic design brief:", brief.id);
    
    return true;
  } catch (error) {
    console.error("Error generating graphic design brief PDF:", error);
    throw error;
  }
};
