
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, isValid, parseISO } from 'date-fns';
import { addLogoToDocument } from './pdfHelpers';
import { 
  addSectionTitle, 
  addField, 
  checkPageOverflow,
  addPdfTitle, 
  addMultiParagraphField,
  addTableToDocument
} from './pdfUtils';

// Fix the getIllustrationDetails function to handle the array/object properly
export const generateIllustrationBriefPDF = async (briefData: any): Promise<void> => {
  try {
    console.log("Generating illustration brief PDF with data:", briefData);
    
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Initialize y position
    let currentY = 20;
    
    // Add title
    currentY = addPdfTitle(doc, "Illustration Design Brief", currentY);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Helper function to safely get values (handles both camelCase and snake_case)
    const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue: any = "Not provided") => {
      const value = briefData[camelCaseKey] !== undefined 
        ? briefData[camelCaseKey] 
        : briefData[snakeCaseKey] !== undefined 
          ? briefData[snakeCaseKey] 
          : defaultValue;
          
      // Check if value is null, undefined, empty string, or empty array
      if (value === null || value === undefined || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        return defaultValue;
      }
      
      return value;
    };
    
    // Helper to safely format dates
    const formatDate = (dateValue: any): string => {
      if (!dateValue) return "Not provided";
      
      try {
        let dateObj;
        
        if (typeof dateValue === 'string') {
          dateObj = parseISO(dateValue);
        } else {
          dateObj = new Date(dateValue);
        }
        
        if (isValid(dateObj)) {
          return format(dateObj, "MMMM d, yyyy");
        }
        return "Invalid date";
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Not provided";
      }
    };
    
    // Helper to handle illustration details which could be an array or object
    const getIllustrationDetails = () => {
      const details = getValue("illustrationDetails", "illustration_details", []);
      return Array.isArray(details) ? details : 
             details && typeof details === 'object' ? [details] : [];
    };

    // Client information section
    currentY = addSectionTitle(doc, "Client Information", currentY);
    currentY = addField(doc, "Name", getValue("name", "name"), currentY);
    currentY = addField(doc, "Email", getValue("email", "email"), currentY);
    currentY = addField(doc, "Company", getValue("companyName", "company_name"), currentY);
    if (getValue("phone", "phone") !== "Not provided") {
      currentY = addField(doc, "Phone", getValue("phone", "phone"), currentY);
    }
    
    // Submission details
    currentY = addSectionTitle(doc, "Submission Details", currentY);
    currentY = addField(doc, "Submitted", formatDate(getValue("submissionDate", "submission_date")), currentY);
    currentY = addField(doc, "Status", getValue("status", "status"), currentY);
    
    // Add brief details
    currentY = addSectionTitle(doc, "Project Information", currentY);
    currentY = addMultiParagraphField(doc, "About Company", getValue("aboutCompany", "about_company"), currentY);
    currentY = addMultiParagraphField(doc, "Illustrations Purpose", getValue("illustrationsPurpose", "illustrations_purpose"), currentY);
    currentY = addMultiParagraphField(doc, "Illustrations For", getValue("illustrationsFor", "illustrations_for"), currentY);
    currentY = addMultiParagraphField(doc, "Target Audience", getValue("targetAudience", "target_audience"), currentY);
    
    // Design Preferences
    currentY = addSectionTitle(doc, "Design Preferences", currentY);
    currentY = addField(doc, "Illustrations Style", getValue("illustrationsStyle", "illustrations_style"), currentY);
    currentY = addField(doc, "Brand Guidelines", getValue("brandGuidelines", "brand_guidelines"), currentY);
    currentY = addField(doc, "General Style", getValue("generalStyle", "general_style"), currentY);
    currentY = addField(doc, "Color Preferences", getValue("colorPreferences", "color_preferences"), currentY);
    currentY = addMultiParagraphField(doc, "Likes/Dislikes in Design", getValue("likeDislikeDesign", "like_dislike_design"), currentY);
    
    // Handle deliverables which could be a string, array, or object
    const deliverables = getValue("deliverables", "deliverables");
    let deliverablesStr = "Not provided";
    
    if (Array.isArray(deliverables)) {
      deliverablesStr = deliverables.join(", ");
    } else if (typeof deliverables === 'string') {
      deliverablesStr = deliverables;
    } else if (typeof deliverables === 'object' && deliverables !== null) {
      // If it's an object with file format properties
      const formats = Object.entries(deliverables)
        .filter(([_, isSelected]) => isSelected === true)
        .map(([key, _]) => key);
      
      deliverablesStr = formats.length > 0 ? formats.join(", ") : "Not provided";
    }
    
    currentY = addField(doc, "File Formats", deliverablesStr, currentY);
    currentY = addField(doc, "Number of Illustrations", String(getValue("illustrationsCount", "illustrations_count")), currentY);
    
    // Competitors Table
    const competitorsHeaders = ["Competitor", "Details"];
    let competitorsData: string[][] = [];
    for (let i = 1; i <= 4; i++) {
      const competitor = getValue(`competitor${i}`, `competitor${i}`);
      if (competitor !== "Not provided") {
        competitorsData.push([`Competitor ${i}`, String(competitor)]);
      }
    }
    
    if (competitorsData.length > 0) {
      currentY = addSectionTitle(doc, "Competitors", currentY);
      currentY = addTableToDocument(doc, competitorsHeaders, competitorsData, currentY);
    }
    
    // Design References Table
    const referencesHeaders = ["Reference", "Details"];
    let referencesData: string[][] = [];
    for (let i = 1; i <= 4; i++) {
      const reference = getValue(`reference${i}`, `reference${i}`);
      if (reference !== "Not provided") {
        referencesData.push([`Reference ${i}`, String(reference)]);
      }
    }
    
    if (referencesData.length > 0) {
      currentY = addSectionTitle(doc, "Design References", currentY);
      currentY = addTableToDocument(doc, referencesHeaders, referencesData, currentY);
    }
    
    // Illustration Details Section
    const illustrationDetails = getIllustrationDetails();
    if (illustrationDetails.length > 0) {
      currentY = addSectionTitle(doc, "Illustration Details", currentY);
      
      for (let i = 0; i < illustrationDetails.length; i++) {
        const detail = illustrationDetails[i];
        currentY = checkPageOverflow(doc, currentY + 8);
        
        currentY = addField(doc, `Illustration ${i + 1}`, detail, currentY);
      }
    }
    
    // Completion Deadline
    const completionDeadline = formatDate(getValue("completionDeadline", "completion_deadline"));
    if (completionDeadline !== "Not provided") {
      currentY = addSectionTitle(doc, "Project Timeline", currentY);
      currentY = addField(doc, "Completion Deadline", completionDeadline, currentY);
    }

    // Save the PDF
    doc.save(`IllustrationBrief-${getValue("companyName", "company_name")}.pdf`);
  } catch (error) {
    console.error("Error generating illustration brief PDF:", error);
    throw error;
  }
};
