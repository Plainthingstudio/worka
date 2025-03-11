
import { jsPDF } from "jspdf";
import { format, isValid, parseISO } from "date-fns";
import { addLogoToDocument } from "./pdfHelpers";

export const generateUIDesignBriefPDF = async (briefData: any): Promise<void> => {
  try {
    console.log("Generating UI design brief PDF with data:", briefData);
    
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 45;
    const lineHeight = 7;
    
    // Add logo and header
    await addLogoToDocument(doc);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("UI Design Brief", pageWidth / 2, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Helper function to safely get values (handles both camelCase and snake_case)
    const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not provided") => {
      const value = briefData[camelCaseKey] !== undefined 
        ? briefData[camelCaseKey] 
        : briefData[snakeCaseKey] !== undefined 
          ? briefData[snakeCaseKey] 
          : defaultValue;
          
      if (value === null || value === undefined || value === "" || 
          (Array.isArray(value) && value.length === 0)) {
        return defaultValue;
      }
      
      return value;
    };

    // Helper function to get website type interest as a string
    const getWebsiteTypeInterest = (): string => {
      const interestObj = getValue("websiteTypeInterest", "website_type_interest", {});
      
      if (typeof interestObj === 'string') return interestObj;
      
      if (Array.isArray(interestObj)) {
        return interestObj.join(", ");
      }
      
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
          .filter(([_, isSelected]) => isSelected === true)
          .map(([key, _]) => websiteTypes[key] || key);
        
        return selectedTypes.length > 0 ? selectedTypes.join(", ") : "Not provided";
      }
      
      return "Not provided";
    };
    
    // Helper to safely get page details
    const getPageDetails = () => {
      const details = getValue("pageDetails", "page_details", []);
      return Array.isArray(details) ? details : 
             details && typeof details === 'object' ? [details] : [];
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

    // Helper function to add a section header
    const addSectionHeader = (text: string) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFont("helvetica", "bold");
      doc.text(text, 20, yPosition);
      yPosition += lineHeight;
      doc.setFont("helvetica", "normal");
    };

    // Helper function to add a field
    const addField = (label: string, value: string) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      const text = `${label}: ${value}`;
      doc.text(text, 20, yPosition);
      yPosition += lineHeight;
    };

    // Client Information Section
    addSectionHeader("Client Information");
    addField("Name", getValue("name", "name"));
    addField("Email", getValue("email", "email"));
    addField("Company", getValue("companyName", "company_name"));
    if (getValue("phone", "phone") !== "Not provided") {
      addField("Phone", getValue("phone", "phone"));
    }
    yPosition += 5;

    // Project Information Section
    addSectionHeader("Project Information");
    addField("Project Type", getValue("projectType", "project_type"));
    addField("Project Size", getValue("projectSize", "project_size"));
    addField("Website Type", getWebsiteTypeInterest());
    addField("Current Website", getValue("currentWebsite", "current_website"));
    addField("Website Purpose", getValue("websitePurpose", "website_purpose"));
    yPosition += 5;

    // Company & Target Audience
    addSectionHeader("Company & Target Audience");
    addField("About Company", getValue("aboutCompany", "about_company"));
    addField("Target Audience", getValue("targetAudience", "target_audience"));
    yPosition += 5;

    // Brand & Design
    addSectionHeader("Brand & Design");
    addField("Existing Brand Assets", getValue("existingBrandAssets", "existing_brand_assets"));
    addField("Brand Guidelines", getValue("hasBrandGuidelines", "has_brand_guidelines"));
    if (getValue("hasBrandGuidelines", "has_brand_guidelines") === "Yes") {
      addField("Guidelines Details", getValue("brandGuidelinesDetails", "brand_guidelines_details"));
    }
    addField("Wireframe Status", getValue("hasWireframe", "has_wireframe"));
    if (getValue("hasWireframe", "has_wireframe") === "Yes") {
      addField("Wireframe Details", getValue("wireframeDetails", "wireframe_details"));
    }
    yPosition += 5;

    // Design Preferences
    addSectionHeader("Design Preferences");
    addField("General Style", getValue("generalStyle", "general_style"));
    addField("Color Preferences", getValue("colorPreferences", "color_preferences"));
    addField("Font Preferences", getValue("fontPreferences", "font_preferences"));
    addField("Style Preferences", getValue("stylePreferences", "style_preferences"));
    yPosition += 5;

    // Page Details
    addSectionHeader("Page Information");
    addField("Number of Pages", String(getValue("pageCount", "page_count")));
    
    const pageDetails = getPageDetails();
    if (pageDetails.length > 0) {
      yPosition += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Page Details:", 20, yPosition);
      yPosition += lineHeight;
      doc.setFont("helvetica", "normal");
      
      pageDetails.forEach((detail: any, index: number) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        const name = detail?.name || "Unnamed Page";
        const description = detail?.description || "No description provided";
        doc.text(`Page ${index + 1}: ${name}`, 20, yPosition);
        yPosition += lineHeight;
        doc.text(description, 25, yPosition);
        yPosition += lineHeight + 2;
      });
    }
    yPosition += 5;

    // Project Delivery
    addSectionHeader("Project Delivery");
    addField("Website Content", getValue("websiteContent", "website_content"));
    addField("Development Service", getValue("developmentService", "development_service"));
    addField("Completion Deadline", formatDate(getValue("completionDeadline", "completion_deadline")));

    // Save the PDF
    const fileName = `UI_Design_Brief_${getValue("name", "name").replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    
  } catch (error) {
    console.error("Error generating UI design brief PDF:", error);
    throw error;
  }
};
