
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
    
    // Helper to safely process page details into a standardized format
    const processPageDetails = () => {
      // First try to get page details from either property
      let details = briefData.pageDetails || briefData.page_details;
      console.log("Initial page details:", details);
      console.log("All brief data keys:", Object.keys(briefData));
      
      // Also check for other possible field names
      if (!details) {
        details = briefData.page_information || briefData.pageInformation;
        console.log("Trying alternative field names:", details);
      }
      
      // If details don't exist, return empty array
      if (!details) {
        console.log("No page details found in any field");
        return [];
      }
      
      // If it's a string, try to parse it as JSON
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
          console.log("Parsed page details from string:", details);
        } catch (e) {
          console.error("Error parsing page details string:", e);
          return [];
        }
      }
      
      // Handle case where details might be an object with numeric keys (from form data)
      if (details && typeof details === 'object' && !Array.isArray(details)) {
        console.log("Converting object to array:", details);
        const detailsArray = [];
        
        // Check if it's a form-style object with numeric keys
        const keys = Object.keys(details).sort((a, b) => parseInt(a) - parseInt(b));
        console.log("Object keys found:", keys);
        
        for (const key of keys) {
          console.log(`Processing key ${key}:`, details[key]);
          if (details[key] && typeof details[key] === 'object') {
            detailsArray.push(details[key]);
          } else if (details[key] && typeof details[key] === 'string') {
            // Handle case where the value might be a simple string
            detailsArray.push({ name: `Page ${parseInt(key) + 1}`, description: details[key] });
          }
        }
        
        if (detailsArray.length > 0) {
          details = detailsArray;
          console.log("Converted page details object to array:", details);
        } else {
          console.log("No valid details found in object");
          return [];
        }
      }
      
      // If details is still not an array at this point, return empty array
      if (!Array.isArray(details)) {
        console.warn("Page details is not an array after processing:", details);
        return [];
      }
      
      // Filter out any null or empty entries and ensure we have valid page data
      const validDetails = details.filter(item => {
        if (!item) return false;
        const hasName = item.name || item.page_name;
        const hasDescription = item.description || item.page_description;
        return hasName || hasDescription;
      });
      
      console.log("Final processed page details:", validDetails);
      return validDetails;
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
    
    
    
    // Page Information Section
    yPosition = addSectionTitle(doc, "Page Information", yPosition);
    yPosition = addField(doc, "Number of Pages", getValue("pageCount", "page_count"), yPosition);
    
    // Process page details into a clean array
    const pageDetails = processPageDetails();
    console.log("Processed page details ready for PDF:", pageDetails);
    console.log("Original brief data for page details:", briefData.pageDetails, briefData.page_details);
    
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
      const tableData = pageDetails.map((detail: any) => {
        // Support both possible property naming conventions
        const name = detail?.name || detail?.page_name || "Unnamed Page";
        const description = detail?.description || detail?.page_description || "No description provided";
        return [name, description];
      });
      
      console.log("Table data for page details:", tableData);
      
      // Add the table to the document
      yPosition = addTableToDocument(doc, tableHeaders, tableData, yPosition);
    } else {
      console.warn("No page details found or they are in an unexpected format");
      yPosition = addField(doc, "Page Details", "No specific page details provided", yPosition);
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
