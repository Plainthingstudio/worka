
import jsPDF from "jspdf";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the logo preferences section in the PDF
 */
export const renderLogoPreferences = (doc: jsPDF, brief: any, startY: number): number => {
  let yPosition = startY;
  
  // Add logo preferences section title
  yPosition = addSectionTitle(doc, "Logo Preferences", yPosition);
  
  // Get logo feelings with safe access
  let logoFeelings = brief.logoFeelings || brief.logo_feelings || null;
  
  // If it's a string, try to parse it
  if (typeof logoFeelings === 'string') {
    try {
      logoFeelings = JSON.parse(logoFeelings);
      console.log("Successfully parsed logoFeelings string in PDF renderer:", logoFeelings);
    } catch (e) {
      console.error("Failed to parse logoFeelings string in PDF renderer:", e);
      logoFeelings = null;
    }
  }
  
  // Ensure it's an object - if not, make it an empty object (not null)
  if (!logoFeelings || typeof logoFeelings !== 'object') {
    logoFeelings = {};
  }
  
  // Helper to safely get logo feeling values with better defaults
  const getLogoFeeling = (key: string, defaultValue = "Not provided") => {
    if (!logoFeelings || typeof logoFeelings !== 'object') return defaultValue;
    
    const value = logoFeelings[key];
    return value || defaultValue;
  };
  
  // Add each logo preference field with more descriptive labels
  yPosition = addField(doc, "Feminine vs Masculine", getLogoFeeling("gender"), yPosition);
  yPosition = addField(doc, "Economical vs Luxury", getLogoFeeling("pricing"), yPosition);
  yPosition = addField(doc, "Modern vs Classic", getLogoFeeling("era"), yPosition);
  yPosition = addField(doc, "Serious vs Playful", getLogoFeeling("tone"), yPosition);
  yPosition = addField(doc, "Simple vs Complex", getLogoFeeling("complexity"), yPosition);
  
  // Add logo type
  const logoType = brief.logoType || brief.logo_type || "Not provided";
  yPosition = addField(doc, "Logo Type", logoType, yPosition);
  
  return yPosition;
};
