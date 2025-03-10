
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
    
    // Helper function to get value that might be in camelCase or snake_case
    const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not specified") => {
      return brief[camelCaseKey] !== undefined ? brief[camelCaseKey] : 
             brief[snakeCaseKey] !== undefined ? brief[snakeCaseKey] : 
             defaultValue;
    };
    
    // Helper function to safely format dates
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return "Not specified";
      
      try {
        // Try to parse the date if it's a string
        const dateObj = typeof dateValue === 'string' 
          ? parseISO(dateValue) 
          : new Date(dateValue);
        
        // Only format if it's a valid date
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
    y = addField(doc, "Name", brief.name || "Not specified", y);
    y = addField(doc, "Email", brief.email || "Not specified", y);
    y = addField(doc, "Company", getValue("companyName", "company_name"), y);
    if (brief.phone) {
      y = addField(doc, "Phone", brief.phone, y);
    }
    y = checkPageOverflow(doc, y);

    // Brief Information
    y = addSectionTitle(doc, "Brief Information", y);
    
    // Submission date
    const submissionDate = getValue("submissionDate", "submission_date");
    y = addField(doc, "Submission Date", formatDate(submissionDate), y);
    y = addField(doc, "Status", brief.status || "Not specified", y);
    y = checkPageOverflow(doc, y);

    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    
    // About Company
    const aboutCompany = getValue("aboutCompany", "about_company");
    y = addMultiParagraphField(doc, "About Company", aboutCompany, y);
    y = checkPageOverflow(doc, y);
    
    // Illustrations Purpose
    const illustrationsPurpose = getValue("illustrationsPurpose", "illustrations_purpose");
    y = addMultiParagraphField(doc, "Illustrations Purpose", illustrationsPurpose, y);
    y = checkPageOverflow(doc, y);
    
    // Illustrations For
    const illustrationsFor = getValue("illustrationsFor", "illustrations_for");
    y = addField(doc, "Illustrations For", illustrationsFor, y);
    y = checkPageOverflow(doc, y);
    
    // Illustrations Style
    const illustrationsStyle = getValue("illustrationsStyle", "illustrations_style");
    y = addField(doc, "Illustrations Style", illustrationsStyle, y);
    y = checkPageOverflow(doc, y);
    
    // Target Audience
    const targetAudience = getValue("targetAudience", "target_audience");
    y = addMultiParagraphField(doc, "Target Audience", targetAudience, y);
    y = checkPageOverflow(doc, y);

    // Competitors
    y = addSectionTitle(doc, "Competitors", y);
    if (brief.competitor1) y = addField(doc, "Competitor 1", brief.competitor1, y);
    if (brief.competitor2) y = addField(doc, "Competitor 2", brief.competitor2, y);
    if (brief.competitor3) y = addField(doc, "Competitor 3", brief.competitor3, y);
    if (brief.competitor4) y = addField(doc, "Competitor 4", brief.competitor4, y);
    if (!brief.competitor1 && !brief.competitor2 && !brief.competitor3 && !brief.competitor4) {
      y = addField(doc, "Competitors", "None specified", y);
    }
    y = checkPageOverflow(doc, y);

    // Brand Guidelines
    const brandGuidelines = getValue("brandGuidelines", "brand_guidelines");
    y = addMultiParagraphField(doc, "Brand Guidelines", brandGuidelines, y);
    y = checkPageOverflow(doc, y);

    // References
    y = addSectionTitle(doc, "Design References", y);
    if (brief.reference1) y = addField(doc, "Reference 1", brief.reference1, y);
    if (brief.reference2) y = addField(doc, "Reference 2", brief.reference2, y);
    if (brief.reference3) y = addField(doc, "Reference 3", brief.reference3, y);
    if (brief.reference4) y = addField(doc, "Reference 4", brief.reference4, y);
    if (!brief.reference1 && !brief.reference2 && !brief.reference3 && !brief.reference4) {
      y = addField(doc, "References", "None specified", y);
    }
    y = checkPageOverflow(doc, y);

    // General Style
    const generalStyle = getValue("generalStyle", "general_style");
    y = addMultiParagraphField(doc, "General Style", generalStyle, y);
    y = checkPageOverflow(doc, y);

    // Color Preferences
    const colorPreferences = getValue("colorPreferences", "color_preferences");
    y = addMultiParagraphField(doc, "Color Preferences", colorPreferences, y);
    y = checkPageOverflow(doc, y);

    // Likes/Dislikes in Design
    const likeDislikeDesign = getValue("likeDislikeDesign", "like_dislike_design");
    y = addMultiParagraphField(doc, "Likes/Dislikes in Design", likeDislikeDesign, y);
    y = checkPageOverflow(doc, y);

    // Illustration Details
    y = addSectionTitle(doc, "Illustration Details", y);
    
    // Get illustrations count
    const illustrationsCount = getValue("illustrationsCount", "illustrations_count", "Not specified");
    y = addField(doc, "Number of Illustrations", String(illustrationsCount), y);
    y = checkPageOverflow(doc, y);
    
    // Get illustration details
    const illustrationDetails = getValue("illustrationDetails", "illustration_details", []);
    if (Array.isArray(illustrationDetails) && illustrationDetails.length > 0) {
      illustrationDetails.forEach((detail: any, index: number) => {
        if (detail) {
          // Ensure detail is a string before passing to addMultiParagraphField
          const detailStr = typeof detail === 'string' ? detail : String(detail);
          y = addMultiParagraphField(doc, `Illustration ${index + 1}`, detailStr, y);
          y = checkPageOverflow(doc, y);
        }
      });
    } else {
      y = addField(doc, "Illustration Details", "Not specified", y);
    }

    // Deliverables
    y = addSectionTitle(doc, "Deliverables", y);
    const deliverables = brief.deliverables;
    if (Array.isArray(deliverables) && deliverables.length > 0) {
      y = addField(doc, "File Formats", deliverables.join(", "), y);
    } else {
      y = addField(doc, "File Formats", "Not specified", y);
    }
    y = checkPageOverflow(doc, y);

    // Deadline
    y = addSectionTitle(doc, "Deadline", y);
    const completionDeadline = getValue("completionDeadline", "completion_deadline");
    y = addField(doc, "Completion Deadline", formatDate(completionDeadline), y);

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
