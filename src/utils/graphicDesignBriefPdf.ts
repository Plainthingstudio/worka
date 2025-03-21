
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
    
    // Make a deep copy of the brief to avoid modifying the original
    const briefCopy = JSON.parse(JSON.stringify(brief));
    
    // Process logo feelings if it exists
    let logoFeelings = briefCopy.logoFeelings || briefCopy.logo_feelings || null;
    
    // If logoFeelings is a string, try to parse it
    if (typeof logoFeelings === 'string') {
      try {
        logoFeelings = JSON.parse(logoFeelings);
        console.log("Successfully parsed logoFeelings string in main PDF generator:", logoFeelings);
      } catch (e) {
        console.error("Failed to parse logoFeelings string in main PDF generator:", e);
        // Instead of setting to null, set to empty object
        logoFeelings = {};
      }
    } else if (!logoFeelings || typeof logoFeelings !== 'object') {
      // Ensure logoFeelings is at least an empty object
      logoFeelings = {};
    }
    
    // Update the brief with the processed logoFeelings
    briefCopy.logoFeelings = logoFeelings;
    
    console.log("Logo feelings data prepared for PDF:", briefCopy.logoFeelings);
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "Graphic Design Brief", y);

    // Render all sections of the PDF using the specialized renderer functions
    y = renderClientAndBriefInfo(doc, briefCopy, y);
    y = renderCompanyInformation(doc, briefCopy, y);
    y = renderLogoPreferences(doc, briefCopy, y);
    y = renderTargetAudience(doc, briefCopy, y);
    y = renderProductInformation(doc, briefCopy, y);
    y = renderCompetitors(doc, briefCopy, y);
    y = renderReferences(doc, briefCopy, y);
    y = renderAdditionalInformation(doc, briefCopy, y);
    y = renderServicesRequired(doc, briefCopy, y);

    // Save the PDF
    doc.save(`Graphic_Design_Brief_${briefCopy.id}.pdf`);
    console.log("PDF saved successfully for graphic design brief:", briefCopy.id);
    
    return true;
  } catch (error) {
    console.error("Error generating graphic design brief PDF:", error);
    throw error;
  }
};
