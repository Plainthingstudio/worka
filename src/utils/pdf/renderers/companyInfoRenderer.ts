
import jsPDF from "jspdf";
import { addSectionTitle, checkPageOverflow, addMultiParagraphField } from "../../pdfUtils";

/**
 * Renders the company information section of the PDF
 */
export const renderCompanyInformation = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Company Information", y);
  y = addMultiParagraphField(doc, "About Company", brief.aboutCompany || brief.about_company, y);
  y = checkPageOverflow(doc, y);
  y = addMultiParagraphField(doc, "Vision & Mission", brief.visionMission || brief.vision_mission, y);
  y = checkPageOverflow(doc, y);
  y = addMultiParagraphField(doc, "Slogan", brief.slogan, y);
  y = checkPageOverflow(doc, y);

  return y;
};
