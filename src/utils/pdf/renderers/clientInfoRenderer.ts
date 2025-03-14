
import jsPDF from "jspdf";
import { format, isValid, parseISO } from "date-fns";
import { addSectionTitle, addField, checkPageOverflow } from "../../pdfUtils";

/**
 * Renders the client and brief information section of the PDF
 */
export const renderClientAndBriefInfo = (doc: jsPDF, brief: any, y: number): number => {
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

  return y;
};
