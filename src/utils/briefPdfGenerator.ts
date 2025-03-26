
// This file re-exports all PDF generation functions from separate files
import { generateIllustrationBriefPDF } from "./illustrationBriefPdf";
import { generateUIDesignBriefPDF } from "./uiDesignBriefPdf";
import { generateGraphicDesignBriefPDF } from "./graphicDesignBriefPdf";

// Unified generator with html2pdf
import { generateBriefPDF } from "./html2pdfGenerator";

export {
  // Legacy exports for backward compatibility
  generateIllustrationBriefPDF,
  generateUIDesignBriefPDF,
  generateGraphicDesignBriefPDF,
  
  // New unified generator
  generateBriefPDF
};
