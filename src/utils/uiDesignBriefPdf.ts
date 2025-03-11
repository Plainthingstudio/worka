
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

export const generateUIDesignBriefPDF = async (brief: any) => {
  try {
    // For debugging
    console.log("Generating UI Design Brief PDF with data:", brief);
    
    // Helper function to get value that might be in camelCase or snake_case
    const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not provided") => {
      const value = brief[camelCaseKey] !== undefined ? brief[camelCaseKey] : 
                   brief[snakeCaseKey] !== undefined ? brief[snakeCaseKey] : 
                   defaultValue;
      
      // Check if value is null, undefined, empty string, or empty array
      if (value === null || value === undefined || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        return defaultValue;
      }
      
      return value;
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

    // Helper function to get website type interest as a string of selected options only
    const getWebsiteTypeInterestString = () => {
      const interestObj = getValue("websiteTypeInterest", "website_type_interest", {});
      
      // If it's already a string (for backward compatibility)
      if (typeof interestObj === 'string') return interestObj;
      
      // If it's an array, join the values
      if (Array.isArray(interestObj)) {
        return interestObj.join(", ");
      }
      
      // If it's an object with boolean values (checkbox selections)
      if (typeof interestObj === 'object' && interestObj !== null) {
        const websiteTypes: Record<string, string> = {
          agency: "Agency Website",
          portfolio: "Portfolio Website",
          finance: "Finance Website",
          saas: "SaaS Website",
          ecommerce: "E-commerce Website",
          web3: "Web3 Website",
          crypto: "Crypto Website",
          webapp: "Web Application",
          desktopapp: "Desktop Application",
          mobileapp: "Mobile Application",
          other: "Other"
        };
        
        const selectedTypes = Object.entries(interestObj)
          .filter(([_, isSelected]) => isSelected)
          .map(([key, _]) => websiteTypes[key] || key);
        
        return selectedTypes.length > 0 ? selectedTypes.join(", ") : "Not provided";
      }
      
      return "Not provided";
    };
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "UI Design Brief", y);

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

    // Project Overview
    y = addSectionTitle(doc, "Project Overview", y);
    y = addMultiParagraphField(doc, "About Company", getValue("aboutCompany", "about_company"), y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Type", getValue("projectType", "project_type"), y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Size", getValue("projectSize", "project_size"), y);
    y = checkPageOverflow(doc, y);
    
    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    y = addMultiParagraphField(doc, "Target Audience", getValue("targetAudience", "target_audience"), y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Website/App Purpose", getValue("websitePurpose", "website_purpose"), y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Project Description", getValue("projectDescription", "project_description"), y);
    y = checkPageOverflow(doc, y);
    
    // Website Type Interest - Show only selected types
    const websiteTypeInterestText = getWebsiteTypeInterestString();
    if (websiteTypeInterestText !== "Not provided") {
      y = addField(doc, "Website Type Interest", websiteTypeInterestText, y);
      y = checkPageOverflow(doc, y);
    }
    
    // Current Website
    const currentWebsite = getValue("currentWebsite", "current_website");
    if (currentWebsite !== "Not provided") {
      y = addField(doc, "Current Website", currentWebsite, y);
      y = checkPageOverflow(doc, y);
    }

    // Competitors
    const competitor1 = getValue("competitor1", "competitor1");
    const competitor2 = getValue("competitor2", "competitor2");
    const competitor3 = getValue("competitor3", "competitor3");
    const competitor4 = getValue("competitor4", "competitor4");
    
    if (competitor1 !== "Not provided" || competitor2 !== "Not provided" || 
        competitor3 !== "Not provided" || competitor4 !== "Not provided") {
      y = addSectionTitle(doc, "Competitors", y);
      if (competitor1 !== "Not provided") y = addField(doc, "Competitor 1", competitor1, y);
      if (competitor2 !== "Not provided") y = addField(doc, "Competitor 2", competitor2, y);
      if (competitor3 !== "Not provided") y = addField(doc, "Competitor 3", competitor3, y);
      if (competitor4 !== "Not provided") y = addField(doc, "Competitor 4", competitor4, y);
      y = checkPageOverflow(doc, y);
    }

    // Design Preferences
    y = addSectionTitle(doc, "Design Preferences", y);
    y = addMultiParagraphField(doc, "General Style", getValue("generalStyle", "general_style"), y);
    y = checkPageOverflow(doc, y);
    
    const colorPreferences = getValue("colorPreferences", "color_preferences");
    if (colorPreferences !== "Not provided") {
      y = addMultiParagraphField(doc, "Color Preferences", colorPreferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    const fontPreferences = getValue("fontPreferences", "font_preferences");
    if (fontPreferences !== "Not provided") {
      y = addMultiParagraphField(doc, "Font Preferences", fontPreferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    const existingBrandAssets = getValue("existingBrandAssets", "existing_brand_assets");
    if (existingBrandAssets !== "Not provided") {
      y = addMultiParagraphField(doc, "Existing Brand Assets", existingBrandAssets, y);
      y = checkPageOverflow(doc, y);
    }
    
    const stylePreferences = getValue("stylePreferences", "style_preferences");
    if (stylePreferences !== "Not provided") {
      y = addMultiParagraphField(doc, "Style Preferences", stylePreferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    // References
    const reference1 = getValue("reference1", "reference1");
    const reference2 = getValue("reference2", "reference2");
    const reference3 = getValue("reference3", "reference3");
    const reference4 = getValue("reference4", "reference4");
    
    if (reference1 !== "Not provided" || reference2 !== "Not provided" || 
        reference3 !== "Not provided" || reference4 !== "Not provided") {
      y = addSectionTitle(doc, "References", y);
      if (reference1 !== "Not provided") y = addField(doc, "Reference 1", reference1, y);
      if (reference2 !== "Not provided") y = addField(doc, "Reference 2", reference2, y);
      if (reference3 !== "Not provided") y = addField(doc, "Reference 3", reference3, y);
      if (reference4 !== "Not provided") y = addField(doc, "Reference 4", reference4, y);
      y = checkPageOverflow(doc, y);
    }

    // Brand Guidelines and Wireframes
    const hasBrandGuidelines = getValue("hasBrandGuidelines", "has_brand_guidelines");
    const hasWireframe = getValue("hasWireframe", "has_wireframe");
    
    if (hasBrandGuidelines !== "Not provided" || hasWireframe !== "Not provided") {
      y = addSectionTitle(doc, "Additional Information", y);
      
      if (hasBrandGuidelines !== "Not provided") {
        y = addField(doc, "Has Brand Guidelines", String(hasBrandGuidelines), y);
        y = checkPageOverflow(doc, y);
        
        const brandGuidelinesDetails = getValue("brandGuidelinesDetails", "brand_guidelines_details");
        if (brandGuidelinesDetails !== "Not provided" && 
            (hasBrandGuidelines === "Yes" || hasBrandGuidelines === true)) {
          y = addMultiParagraphField(doc, "Brand Guidelines Details", brandGuidelinesDetails, y);
          y = checkPageOverflow(doc, y);
        }
      }
      
      if (hasWireframe !== "Not provided") {
        y = addField(doc, "Has Wireframes", String(hasWireframe), y);
        y = checkPageOverflow(doc, y);
        
        const wireframeDetails = getValue("wireframeDetails", "wireframe_details");
        if (wireframeDetails !== "Not provided" && 
            (hasWireframe === "Yes" || hasWireframe === true)) {
          y = addMultiParagraphField(doc, "Wireframe Details", wireframeDetails, y);
          y = checkPageOverflow(doc, y);
        }
      }
    }

    // Page Details
    const pageCount = getValue("pageCount", "page_count");
    const pageDetails = getValue("pageDetails", "page_details");
    
    if (pageCount !== "Not provided" || (pageDetails !== "Not provided" && pageDetails.length > 0)) {
      y = addSectionTitle(doc, "Page Details", y);
      
      if (pageCount !== "Not provided") {
        y = addField(doc, "Number of Pages", String(pageCount), y);
        y = checkPageOverflow(doc, y);
      }
      
      // Process page details
      const processedPageDetails = Array.isArray(pageDetails) ? pageDetails : 
                                  pageDetails && typeof pageDetails === 'object' ? [pageDetails] : [];
                                  
      if (processedPageDetails.length > 0) {
        processedPageDetails.forEach((page: any, index: number) => {
          if (page) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`Page ${index + 1}:`, 20, y);
            doc.setFont("helvetica", "normal");
            y += 6;
            
            if (page.name) {
              y = addField(doc, "Name", page.name, y);
            }
            
            if (page.description) {
              y = addMultiParagraphField(doc, "Description", page.description, y);
            }
            
            y = checkPageOverflow(doc, y);
          }
        });
      }
    }
    
    // Implementation Details
    const websiteContent = getValue("websiteContent", "website_content");
    const developmentService = getValue("developmentService", "development_service");
    
    if (websiteContent !== "Not provided" || developmentService !== "Not provided") {
      y = addSectionTitle(doc, "Implementation Details", y);
      
      if (websiteContent !== "Not provided") {
        y = addMultiParagraphField(doc, "Website Content", websiteContent, y);
        y = checkPageOverflow(doc, y);
      }
      
      if (developmentService !== "Not provided") {
        y = addField(doc, "Development Service", developmentService, y);
        y = checkPageOverflow(doc, y);
      }
    }

    // Deadline
    const completionDeadline = getValue("completionDeadline", "completion_deadline");
    if (completionDeadline !== "Not provided") {
      y = addSectionTitle(doc, "Deadline", y);
      y = addField(doc, "Completion Deadline", formatDate(completionDeadline), y);
    }

    // Save the PDF
    const pdfName = `UI_Design_Brief_${brief.id || new Date().getTime()}.pdf`;
    doc.save(pdfName);
    console.log("PDF saved successfully for UI design brief:", pdfName);
    
    return true;
  } catch (error) {
    console.error("Error generating UI brief PDF:", error);
    throw error;
  }
};
