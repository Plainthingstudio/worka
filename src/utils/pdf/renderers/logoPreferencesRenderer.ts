
import jsPDF from "jspdf";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the logo preferences section of the PDF
 */
export const renderLogoPreferences = (doc: jsPDF, brief: any, y: number): number => {
  // Accessing logoFeelings from both possible structures and ensuring it exists
  const logoFeelings = brief.logoFeelings || brief.logo_feelings || {};
  
  y = addSectionTitle(doc, "Logo Preferences", y);
  
  // Process each logo feeling attribute individually with page break checking after each
  // Explicitly check each property of logoFeelings
  if (logoFeelings.gender) {
    y = addField(doc, "Feminine vs Masculine", logoFeelings.gender, y);
    y = checkPageOverflow(doc, y);
  }
  
  if (logoFeelings.pricing) {
    y = addField(doc, "Economical vs Luxury", logoFeelings.pricing, y);
    y = checkPageOverflow(doc, y);
  }
  
  if (logoFeelings.era) {
    y = addField(doc, "Modern vs Classic", logoFeelings.era, y);
    y = checkPageOverflow(doc, y);
  }
  
  if (logoFeelings.tone) {
    y = addField(doc, "Serious vs Playful", logoFeelings.tone, y);
    y = checkPageOverflow(doc, y);
  }
  
  if (logoFeelings.complexity) {
    y = addField(doc, "Simple vs Complex", logoFeelings.complexity, y);
    y = checkPageOverflow(doc, y);
  }
  
  // Logo Type
  const logoType = brief.logoType || brief.logo_type;
  if (logoType) {
    y = addField(doc, "Logo Type", logoType, y);
    y = checkPageOverflow(doc, y);
  }

  return y;
};
