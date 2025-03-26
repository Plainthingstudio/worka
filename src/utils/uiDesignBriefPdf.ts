
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
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
    
    // Helper to safely get page details
    const getPageDetails = () => {
      let details = briefData.pageDetails || briefData.page_details || [];
      
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
        } catch {
          return [];
        }
      }
      
      // Ensure details is an array
      return Array.isArray(details) ? details : 
             details && typeof details === 'object' ? [details] : [];
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
    yPosition = addField(doc, "Project Type", getValue("projectType", "project_type"), yPosition);
    yPosition = addField(doc, "Project Size", getValue("projectSize", "project_size"), yPosition);
    yPosition = addField(doc, "Website Type", getValue("websiteTypeInterest", "website_type_interest"), yPosition);
    yPosition = addField(doc, "Current Website", getValue("currentWebsite", "current_website"), yPosition);
    yPosition = addMultiParagraphField(doc, "Website Purpose", getValue("websitePurpose", "website_purpose"), yPosition);
    
    // Company & Target Audience
    yPosition = addSectionTitle(doc, "Company & Target Audience", yPosition);
    yPosition = addMultiParagraphField(doc, "About Company", getValue("aboutCompany", "about_company"), yPosition);
    yPosition = addMultiParagraphField(doc, "Target Audience", getValue("targetAudience", "target_audience"), yPosition);
    
    // Brand & Design
    yPosition = addSectionTitle(doc, "Brand & Design", yPosition);
    yPosition = addField(doc, "Existing Brand Assets", getValue("existingBrandAssets", "existing_brand_assets"), yPosition);
    yPosition = addField(doc, "Brand Guidelines", getValue("hasBrandGuidelines", "has_brand_guidelines"), yPosition);
    if (getValue("hasBrandGuidelines", "has_brand_guidelines") === "Yes") {
      yPosition = addMultiParagraphField(doc, "Guidelines Details", getValue("brandGuidelinesDetails", "brand_guidelines_details"), yPosition);
    }
    yPosition = addField(doc, "Wireframe Status", getValue("hasWireframe", "has_wireframe"), yPosition);
    if (getValue("hasWireframe", "has_wireframe") === "Yes") {
      yPosition = addMultiParagraphField(doc, "Wireframe Details", getValue("wireframeDetails", "wireframe_details"), yPosition);
    }
    
    // Design Preferences
    yPosition = addSectionTitle(doc, "Design Preferences", yPosition);
    yPosition = addField(doc, "General Style", getValue("generalStyle", "general_style"), yPosition);
    yPosition = addField(doc, "Color Preferences", getValue("colorPreferences", "color_preferences"), yPosition);
    yPosition = addField(doc, "Font Preferences", getValue("fontPreferences", "font_preferences"), yPosition);
    yPosition = addMultiParagraphField(doc, "Style Preferences", getValue("stylePreferences", "style_preferences"), yPosition);
    
    // References Section
    const references = [];
    if (getValue("reference1", "reference1") !== "Not provided") references.push(getValue("reference1", "reference1"));
    if (getValue("reference2", "reference2") !== "Not provided") references.push(getValue("reference2", "reference2"));
    if (getValue("reference3", "reference3") !== "Not provided") references.push(getValue("reference3", "reference3"));
    if (getValue("reference4", "reference4") !== "Not provided") references.push(getValue("reference4", "reference4"));
    
    if (references.length > 0) {
      yPosition = checkPageOverflow(doc, yPosition + 8);
      yPosition = addField(doc, "Design References", references.map((ref, idx) => `${idx + 1}. ${ref}`).join('\n'), yPosition);
    }
    
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
    
    // Page Information Section
    yPosition = addSectionTitle(doc, "Page Information", yPosition);
    yPosition = addField(doc, "Number of Pages", getValue("pageCount", "page_count"), yPosition);
    
    // Get the page details
    const pageDetails = getPageDetails();
    
    // Add page details table if available
    if (pageDetails && pageDetails.length > 0) {
      yPosition = checkPageOverflow(doc, yPosition + 10);
      
      // Create a header for the page details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Page Details:", 20, yPosition);
      yPosition += 8;
      
      // Create table headers and data for the page details
      const tableHeaders = ["Page Name", "Description"];
      const tableData = pageDetails.map((detail: any, index: number) => {
        const name = detail?.name || detail?.page_name || `Page ${index + 1}`;
        const description = detail?.description || detail?.page_description || "No description provided";
        return [name, description];
      });
      
      // Add the table to the document
      yPosition = addTableToDocument(doc, tableHeaders, tableData, yPosition);
    }
    
    // Project Delivery
    yPosition = addSectionTitle(doc, "Project Delivery", yPosition);
    yPosition = addField(doc, "Website Content", getValue("websiteContent", "website_content"), yPosition);
    yPosition = addField(doc, "Development Service", getValue("developmentService", "development_service"), yPosition);
    
    // Format the date properly for the deadline
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
    yPosition = addField(doc, "Completion Deadline", formattedDeadline, yPosition);
    
    // Save the PDF
    const fileName = `UI_Design_Brief_${getValue("name", "name").replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error("Error generating UI design brief PDF:", error);
    throw error;
  }
};
