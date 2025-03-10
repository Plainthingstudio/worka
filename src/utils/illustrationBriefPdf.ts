
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
    // For debugging
    console.log("Generating Illustration Brief PDF with data:", brief);
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "Illustration Design Brief", y);

    // Client Information
    y = addSectionTitle(doc, "Client Information", y);
    y = addField(doc, "Name", brief.name, y);
    y = addField(doc, "Email", brief.email, y);
    y = addField(doc, "Company", brief.companyName || brief.company_name, y);
    y = checkPageOverflow(doc, y);

    // Brief Information
    y = addSectionTitle(doc, "Brief Information", y);
    
    // Safely format the submission date
    let submissionDateFormatted = "Not specified";
    if (brief.submissionDate || brief.submission_date) {
      try {
        // Try to parse the date if it's a string
        const dateValue = brief.submissionDate || brief.submission_date;
        const dateObj = typeof dateValue === 'string' 
          ? parseISO(dateValue) 
          : new Date(dateValue);
        
        // Only format if it's a valid date
        if (isValid(dateObj)) {
          submissionDateFormatted = format(dateObj, "MMMM dd, yyyy");
        }
      } catch (error) {
        console.error("Error formatting submission date:", error);
      }
    }
    
    y = addField(doc, "Submission Date", submissionDateFormatted, y);
    y = addField(doc, "Status", brief.status, y);
    y = checkPageOverflow(doc, y);

    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    y = addMultiParagraphField(doc, "About Company", brief.aboutCompany || brief.about_company, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Illustrations Purpose", brief.illustrationsPurpose || brief.illustrations_purpose, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Illustrations For", brief.illustrationsFor || brief.illustrations_for, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Illustrations Style", brief.illustrationsStyle || brief.illustrations_style, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Target Audience", brief.targetAudience || brief.target_audience, y);
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
    } else if (brief.illustration_details && brief.illustration_details.length > 0) {
      y = addSectionTitle(doc, "Illustration Details", y);
      y = addField(doc, "Number of Illustrations", brief.illustrations_count?.toString() || "Not specified", y);
      y = checkPageOverflow(doc, y);
      
      brief.illustration_details.forEach((detail: string, index: number) => {
        if (detail) {
          y = addMultiParagraphField(doc, `Illustration ${index + 1}`, detail, y);
          y = checkPageOverflow(doc, y);
        }
      });
    }

    // Deliverables
    if (brief.deliverables && brief.deliverables.length > 0) {
      y = addSectionTitle(doc, "Deliverables", y);
      y = addField(doc, "File Formats", Array.isArray(brief.deliverables) ? brief.deliverables.join(", ") : brief.deliverables, y);
      y = checkPageOverflow(doc, y);
    }

    // Deadline - Handle with safe date formatting
    y = addSectionTitle(doc, "Deadline", y);
    let deadlineValue = "Not specified";
    
    if (brief.completionDeadline || brief.completion_deadline) {
      try {
        // Try to parse the date if it's a string
        const dateValue = brief.completionDeadline || brief.completion_deadline;
        const deadlineObj = typeof dateValue === 'string' 
          ? parseISO(dateValue) 
          : new Date(dateValue);
        
        // Only format if it's a valid date
        if (isValid(deadlineObj)) {
          deadlineValue = format(deadlineObj, "MMMM dd, yyyy");
        }
      } catch (error) {
        console.error("Error formatting completion deadline:", error);
      }
    }
    
    y = addField(doc, "Completion Deadline", deadlineValue, y);

    // Save the PDF
    doc.save(`Illustration_Brief_${brief.id}.pdf`);
    console.log("PDF saved successfully for illustration brief:", brief.id);
    
    return true;
  } catch (error) {
    console.error("Error generating illustration brief PDF:", error);
    throw error;
  }
};
