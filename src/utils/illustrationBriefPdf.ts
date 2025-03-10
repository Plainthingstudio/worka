
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
    console.log("Generating Illustration Brief PDF with data:", brief);
    
    // Helper function to get value that might be in camelCase or snake_case
    const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not provided") => {
      const value = brief[camelCaseKey] !== undefined ? brief[camelCaseKey] : 
                   brief[snakeCaseKey] !== undefined ? brief[snakeCaseKey] : 
                   defaultValue;
      return value || defaultValue; // Return defaultValue if value is null/undefined
    };
    
    // Helper function to safely format dates
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return "Not provided";
      
      try {
        const dateObj = typeof dateValue === 'string' 
          ? parseISO(dateValue) 
          : new Date(dateValue);
        
        if (isValid(dateObj)) {
          return format(dateObj, "MMMM dd, yyyy");
        }
        return "Invalid date format";
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Date format error";
      }
    };
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "Illustration Design Brief", y);

    // Client Information
    y = addSectionTitle(doc, "Client Information", y);
    y = addField(doc, "Name", brief.name || "Not provided", y);
    y = addField(doc, "Email", brief.email || "Not provided", y);
    y = addField(doc, "Company", getValue("companyName", "company_name"), y);
    if (brief.phone) {
      y = addField(doc, "Phone", brief.phone, y);
    }
    y = checkPageOverflow(doc, y);

    // Brief Information
    y = addSectionTitle(doc, "Brief Information", y);
    y = addField(doc, "Submission Date", formatDate(getValue("submissionDate", "submission_date")), y);
    y = addField(doc, "Status", brief.status || "Not provided", y);
    y = checkPageOverflow(doc, y);

    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    
    // About Company
    y = addMultiParagraphField(doc, "About Company", getValue("aboutCompany", "about_company"), y);
    y = checkPageOverflow(doc, y);
    
    // Illustrations Purpose
    y = addMultiParagraphField(doc, "Illustrations Purpose", getValue("illustrationsPurpose", "illustrations_purpose"), y);
    y = checkPageOverflow(doc, y);
    
    // Illustrations For
    y = addMultiParagraphField(doc, "Illustrations For", getValue("illustrationsFor", "illustrations_for"), y);
    y = checkPageOverflow(doc, y);
    
    // Illustrations Style
    y = addMultiParagraphField(doc, "Illustrations Style", getValue("illustrationsStyle", "illustrations_style"), y);
    y = checkPageOverflow(doc, y);
    
    // Target Audience
    y = addMultiParagraphField(doc, "Target Audience", getValue("targetAudience", "target_audience"), y);
    y = checkPageOverflow(doc, y);

    // Competitors
    y = addSectionTitle(doc, "Competitors", y);
    const competitor1 = getValue("competitor1", "competitor1");
    const competitor2 = getValue("competitor2", "competitor2");
    const competitor3 = getValue("competitor3", "competitor3");
    const competitor4 = getValue("competitor4", "competitor4");
    
    if (competitor1 !== "Not provided") y = addField(doc, "Competitor 1", competitor1, y);
    if (competitor2 !== "Not provided") y = addField(doc, "Competitor 2", competitor2, y);
    if (competitor3 !== "Not provided") y = addField(doc, "Competitor 3", competitor3, y);
    if (competitor4 !== "Not provided") y = addField(doc, "Competitor 4", competitor4, y);
    if (competitor1 === "Not provided" && competitor2 === "Not provided" && 
        competitor3 === "Not provided" && competitor4 === "Not provided") {
      y = addField(doc, "Competitors", "None provided", y);
    }
    y = checkPageOverflow(doc, y);

    // Brand Guidelines
    y = addMultiParagraphField(doc, "Brand Guidelines", getValue("brandGuidelines", "brand_guidelines"), y);
    y = checkPageOverflow(doc, y);

    // References
    y = addSectionTitle(doc, "Design References", y);
    const reference1 = getValue("reference1", "reference1");
    const reference2 = getValue("reference2", "reference2");
    const reference3 = getValue("reference3", "reference3");
    const reference4 = getValue("reference4", "reference4");
    
    if (reference1 !== "Not provided") y = addField(doc, "Reference 1", reference1, y);
    if (reference2 !== "Not provided") y = addField(doc, "Reference 2", reference2, y);
    if (reference3 !== "Not provided") y = addField(doc, "Reference 3", reference3, y);
    if (reference4 !== "Not provided") y = addField(doc, "Reference 4", reference4, y);
    if (reference1 === "Not provided" && reference2 === "Not provided" && 
        reference3 === "Not provided" && reference4 === "Not provided") {
      y = addField(doc, "References", "None provided", y);
    }
    y = checkPageOverflow(doc, y);

    // General Style
    y = addMultiParagraphField(doc, "General Style", getValue("generalStyle", "general_style"), y);
    y = checkPageOverflow(doc, y);

    // Color Preferences
    y = addMultiParagraphField(doc, "Color Preferences", getValue("colorPreferences", "color_preferences"), y);
    y = checkPageOverflow(doc, y);

    // Likes/Dislikes in Design
    y = addMultiParagraphField(doc, "Likes/Dislikes in Design", getValue("likeDislikeDesign", "like_dislike_design"), y);
    y = checkPageOverflow(doc, y);

    // Illustration Details
    y = addSectionTitle(doc, "Illustration Details", y);
    
    // Illustrations Count
    const count = getValue("illustrationsCount", "illustrations_count");
    y = addField(doc, "Number of Illustrations", String(count), y);
    y = checkPageOverflow(doc, y);
    
    // Illustration Details
    const details = getValue("illustrationDetails", "illustration_details", []);
    if (Array.isArray(details) && details.length > 0) {
      details.forEach((detail, index) => {
        if (detail) {
          const detailText = typeof detail === 'string' ? detail : String(detail);
          y = addMultiParagraphField(doc, `Illustration ${index + 1}`, detailText, y);
          y = checkPageOverflow(doc, y);
        }
      });
    }

    // Deliverables
    y = addSectionTitle(doc, "Deliverables", y);
    const deliverables = Array.isArray(brief.deliverables) ? brief.deliverables.join(", ") : "Not provided";
    y = addField(doc, "File Formats", deliverables, y);
    y = checkPageOverflow(doc, y);

    // Deadline
    y = addSectionTitle(doc, "Deadline", y);
    y = addField(doc, "Completion Deadline", getValue("completionDeadline", "completion_deadline"), y);

    // Save the PDF
    const pdfName = `Illustration_Brief_${brief.id || new Date().getTime()}.pdf`;
    doc.save(pdfName);
    console.log("PDF saved successfully:", pdfName);
    
    return true;
  } catch (error) {
    console.error("Error generating illustration brief PDF:", error);
    throw error;
  }
};
