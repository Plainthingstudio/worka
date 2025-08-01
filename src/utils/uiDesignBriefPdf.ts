
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import { addLogoToDocument } from "./pdfHelpers";
import { 
  addSectionTitle, 
  addField, 
  checkPageOverflow,
  addPdfTitle,
  addMultiParagraphField,
  addTableToDocument
} from "./pdfUtils";

export const generateUIDesignBriefPDF = async (briefData: any): Promise<void> => {
  try {
    console.log("Generating UI design brief PDF with data:", briefData);
    
    // Create a new PDF document
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Add title
    yPosition = addPdfTitle(doc, "UI Design Brief", yPosition);
    
    // Helper function to safely get values (handles both camelCase and snake_case)
    const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue: any = "Not provided") => {
      const value = briefData[camelCaseKey] !== undefined 
        ? briefData[camelCaseKey] 
        : briefData[snakeCaseKey] !== undefined 
          ? briefData[snakeCaseKey] 
          : defaultValue;
      
      if (value === null || value === undefined || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        return defaultValue;
      }
      
      // Convert arrays and objects to strings to avoid PDF generation errors
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      
      // Ensure we return a string
      return String(value);
    };
    
    
    // Client Information Section
    yPosition = addSectionTitle(doc, "Client Information", yPosition);
    yPosition = addField(doc, "Name", getValue("name", "name"), yPosition);
    yPosition = addField(doc, "Email", getValue("email", "email"), yPosition);
    yPosition = addField(doc, "Company", getValue("companyName", "company_name"), yPosition);
    if (getValue("phone", "phone") !== "Not provided") {
      yPosition = addField(doc, "Phone", getValue("phone", "phone"), yPosition);
    }
    
    // Project Information Section
    yPosition = addSectionTitle(doc, "Project Information", yPosition);
    yPosition = addMultiParagraphField(doc, "Project Description", getValue("projectDescription", "project_description"), yPosition);
    
    // Format deadline for PDF
    const deadlineValue = getValue("completionDeadline", "completion_deadline");
    let formattedDeadline = "Not provided";
    if (deadlineValue && deadlineValue !== "Not provided") {
      try {
        const deadlineDate = new Date(deadlineValue);
        if (!isNaN(deadlineDate.getTime())) {
          formattedDeadline = format(deadlineDate, "MMMM d, yyyy");
        }
      } catch (e) {
        console.error("Error formatting deadline:", e);
      }
    }
    yPosition = addField(doc, "Deadline Project", formattedDeadline, yPosition);
    
    yPosition = addField(doc, "Project Type", getValue("projectType", "project_type"), yPosition);
    yPosition = addField(doc, "Project Size", getValue("projectSize", "project_size"), yPosition);
    yPosition = addField(doc, "Website Type", getValue("websiteType", "website_type_interest"), yPosition);
    yPosition = addField(doc, "Current Website", getValue("currentWebsite", "current_website"), yPosition);
    yPosition = addMultiParagraphField(doc, "Website Purpose", getValue("websitePurpose", "website_purpose"), yPosition);
    
    // Company & Target Audience
    yPosition = addSectionTitle(doc, "Company & Target Audience", yPosition);
    yPosition = addMultiParagraphField(doc, "About Company", getValue("aboutCompany", "about_company"), yPosition);
    yPosition = addMultiParagraphField(doc, "Target Audience", getValue("targetAudience", "target_audience"), yPosition);
    yPosition = addField(doc, "Industry", getValue("industry", "industry"), yPosition);
    
    // Competitors Section
    const competitors = [];
    if (getValue("competitor1", "competitor1") !== "Not provided") competitors.push(getValue("competitor1", "competitor1"));
    if (getValue("competitor2", "competitor2") !== "Not provided") competitors.push(getValue("competitor2", "competitor2"));
    if (getValue("competitor3", "competitor3") !== "Not provided") competitors.push(getValue("competitor3", "competitor3"));
    if (getValue("competitor4", "competitor4") !== "Not provided") competitors.push(getValue("competitor4", "competitor4"));
    
    if (competitors.length > 0) {
      yPosition = checkPageOverflow(doc, yPosition + 8);
      yPosition = addField(doc, "Competitors", competitors.map((comp, idx) => `${idx + 1}. ${comp}`).join('\n'), yPosition);
    }
    
    // Design Preferences
    yPosition = addSectionTitle(doc, "Design Preferences", yPosition);
    yPosition = addMultiParagraphField(doc, "General Style", getValue("generalStyle", "general_style"), yPosition);
    yPosition = addField(doc, "Color Preferences", getValue("colorPreferences", "color_preferences"), yPosition);
    
    // References Section
    const references = [];
    if (getValue("reference1", "reference1") !== "Not provided") references.push(getValue("reference1", "reference1"));
    if (getValue("reference2", "reference2") !== "Not provided") references.push(getValue("reference2", "reference2"));
    if (getValue("reference3", "reference3") !== "Not provided") references.push(getValue("reference3", "reference3"));
    if (getValue("reference4", "reference4") !== "Not provided") references.push(getValue("reference4", "reference4"));
    
    if (references.length > 0) {
      yPosition = checkPageOverflow(doc, yPosition + 8);
      yPosition = addField(doc, "References", references.map((ref, idx) => `${idx + 1}. ${ref}`).join('\n'), yPosition);
    }
    
    // Brand & Design
    yPosition = addSectionTitle(doc, "Brand & Design", yPosition);
    yPosition = addField(doc, "Existing Brand Assets", getValue("existingBrandAssets", "existing_brand_assets"), yPosition);
    if (getValue("brandAssetsDetails", "brand_guidelines_details") !== "Not provided") {
      yPosition = addMultiParagraphField(doc, "Brand Assets Details", getValue("brandAssetsDetails", "brand_guidelines_details"), yPosition);
    }
    yPosition = addField(doc, "Wireframe", getValue("hasWireframe", "has_wireframe"), yPosition);
    if (getValue("wireframeDetails", "wireframe_details") !== "Not provided") {
      yPosition = addMultiParagraphField(doc, "Wireframe Details", getValue("wireframeDetails", "wireframe_details"), yPosition);
    }
    
    
    // Website Content and Development Service
    yPosition = addSectionTitle(doc, "Final Details", yPosition);
    yPosition = addField(doc, "Website Content", getValue("websiteContent", "website_content"), yPosition);
    yPosition = addField(doc, "Development Service", getValue("developmentService", "development_service"), yPosition);
    
    // Save the PDF
    const fileName = `UI_Design_Brief_${getValue("name", "name").replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generating UI design brief PDF:", error);
    throw error;
  }
};
