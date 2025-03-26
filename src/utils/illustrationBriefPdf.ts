
import { generateBriefPDF } from './html2pdfGenerator';

// This is a transitional function that uses the new HTML-based generator
export const generateIllustrationBriefPDF = async (briefData: any): Promise<void> => {
  // Set the type to ensure correct template selection
  const briefWithType = {
    ...briefData,
    type: "Illustration Design"
  };
  
  // Use the new unified PDF generator
  return generateBriefPDF(briefWithType);
};
