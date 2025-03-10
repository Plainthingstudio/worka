
import jsPDF from "jspdf";
import { format, isValid, parseISO } from "date-fns";
import { 
  addSectionTitle, 
  addField, 
  checkPageOverflow, 
  addPdfTitle, 
  addMultiParagraphField,
  addSeparator 
} from "./pdfUtils";

export const generateIllustrationBriefPDF = async (brief: any) => {
  try {
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "Illustration Design Brief", y);

    // Client Information
    y = addSectionTitle(doc, "Client Information", y);
    y = addField(doc, "Name", brief.name, y);
    y = addField(doc, "Email", brief.email, y);
    y = addField(doc, "Company", brief.companyName, y);
    y = checkPageOverflow(doc, y);

    // Brief Information
    y = addSectionTitle(doc, "Brief Information", y);
    
    // Safely format the submission date
    let submissionDateFormatted = "Not specified";
    if (brief.submissionDate) {
      // Try to parse the date if it's a string
      const dateObj = typeof brief.submissionDate === 'string' 
        ? parseISO(brief.submissionDate) 
        : new Date(brief.submissionDate);
      
      // Only format if it's a valid date
      if (isValid(dateObj)) {
        submissionDateFormatted = format(dateObj, "MMMM dd, yyyy");
      }
    }
    
    y = addField(doc, "Submission Date", submissionDateFormatted, y);
    y = addField(doc, "Status", brief.status, y);
    y = checkPageOverflow(doc, y);

    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    y = addMultiParagraphField(doc, "About Company", brief.aboutCompany, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Illustrations Purpose", brief.illustrationsPurpose, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Illustrations For", brief.illustrationsFor, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Illustrations Style", brief.illustrationsStyle, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Target Audience", brief.targetAudience, y);
    y = checkPageOverflow(doc, y);

    // References
    if (brief.reference1 || brief.reference2 || brief.reference3 || brief.reference4) {
      y = addSectionTitle(doc, "References", y);
      if (brief.reference1) y = addField(doc, "Reference 1", brief.reference1, y);
      if (brief.reference2) y = addField(doc, "Reference 2", brief.reference2, y);
      if (brief.reference3) y = addField(doc, "Reference 3", brief.reference3, y);
      if (brief.reference4) y = addField(doc, "Reference 4", brief.reference4, y);
      y = checkPageOverflow(doc, y);
    }

    // Illustration Details
    if (brief.illustrationDetails && brief.illustrationDetails.length > 0) {
      y = addSectionTitle(doc, "Illustration Details", y);
      y = addField(doc, "Number of Illustrations", brief.illustrationsCount?.toString() || "Not specified", y);
      y = checkPageOverflow(doc, y);
      
      brief.illustrationDetails.forEach((detail: string, index: number) => {
        if (detail) {
          y = addMultiParagraphField(doc, `Illustration ${index + 1}`, detail, y);
          y = checkPageOverflow(doc, y);
        }
      });
    }

    // Deliverables
    if (brief.deliverables && brief.deliverables.length > 0) {
      y = addSectionTitle(doc, "Deliverables", y);
      y = addField(doc, "File Formats", brief.deliverables.join(", "), y);
      y = checkPageOverflow(doc, y);
    }

    // Deadline - Handle with safe date formatting
    y = addSectionTitle(doc, "Deadline", y);
    let deadlineValue = "Not specified";
    
    if (brief.completionDeadline) {
      // Try to parse the date if it's a string
      const deadlineObj = typeof brief.completionDeadline === 'string' 
        ? parseISO(brief.completionDeadline) 
        : new Date(brief.completionDeadline);
      
      // Only format if it's a valid date
      if (isValid(deadlineObj)) {
        deadlineValue = format(deadlineObj, "MMMM dd, yyyy");
      }
    }
    
    y = addField(doc, "Completion Deadline", deadlineValue, y);

    // Save the PDF
    doc.save(`Illustration_Brief_${brief.id}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating illustration brief PDF:", error);
    throw error;
  }
};
