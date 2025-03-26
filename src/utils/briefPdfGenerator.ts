
// This file re-exports all PDF generation functions from separate files
import { generateIllustrationBriefPDF } from "./illustrationBriefPdf";
import { generateUIDesignBriefPDF } from "./uiDesignBriefPdf";
import { generateGraphicDesignBriefPDF } from "./graphicDesignBriefPdf";

export {
  generateIllustrationBriefPDF,
  generateUIDesignBriefPDF,
  generateGraphicDesignBriefPDF
};
