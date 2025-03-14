
import jsPDF from "jspdf";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the target audience section of the PDF
 */
export const renderTargetAudience = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Target Audience", y);
  if (brief.targetAge || brief.target_age) {
    y = addField(doc, "Age Range", brief.targetAge || brief.target_age, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetGender || brief.target_gender) {
    y = addField(doc, "Gender", brief.targetGender || brief.target_gender, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetDemography || brief.target_demography) {
    y = addField(doc, "Demography", brief.targetDemography || brief.target_demography, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetProfession || brief.target_profession) {
    y = addField(doc, "Profession", brief.targetProfession || brief.target_profession, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetPersonality || brief.target_personality) {
    y = addField(doc, "Personality", brief.targetPersonality || brief.target_personality, y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};
