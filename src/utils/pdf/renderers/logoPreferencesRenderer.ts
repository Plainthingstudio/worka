
import jsPDF from "jspdf";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the logo preferences section in the PDF
 */
export const renderLogoPreferences = (doc: jsPDF, brief: any, startY: number): number => {
  let yPosition = startY;
  
  // Add logo preferences section title
  yPosition = addSectionTitle(doc, "Logo Preferences", yPosition);
  
  // Log the brief data to help debug
  console.log("Logo preferences renderer received brief data:", brief);
  
  // Handle logo feelings with safe access and better error handling
  let logoFeelings = null;
  try {
    // Allow for different property names (camelCase and snake_case)
    logoFeelings = brief.logoFeelings || brief.logo_feelings || null;
    console.log("Logo feelings initial data:", logoFeelings);
    
    // If it's a string, try to parse it as JSON
    if (typeof logoFeelings === 'string') {
      try {
        logoFeelings = JSON.parse(logoFeelings);
        console.log("Successfully parsed logoFeelings string in PDF renderer:", logoFeelings);
      } catch (e) {
        console.error("Failed to parse logoFeelings string in PDF renderer:", e);
        // Don't set to null, create an empty object instead
        logoFeelings = {};
      }
    }
    
    // Ensure we have an object, not null
    if (!logoFeelings || typeof logoFeelings !== 'object') {
      logoFeelings = {};
    }
  } catch (error) {
    console.error("Error processing logoFeelings in PDF renderer:", error);
    logoFeelings = {};
  }
  
  console.log("Final logoFeelings for PDF rendering:", logoFeelings);
  
  // Helper to safely get logo feeling values with better defaults
  const getLogoFeeling = (key: string, defaultValue = "Not provided") => {
    if (!logoFeelings || typeof logoFeelings !== 'object') return defaultValue;
    
    // Access the property safely
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
