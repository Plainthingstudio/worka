
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
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "UI Design Brief", y);

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

    // Project Overview
    y = addSectionTitle(doc, "Project Overview", y);
    y = addMultiParagraphField(doc, "About Company", brief.aboutCompany || brief.about_company, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Type", brief.projectType || brief.project_type, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Size", brief.projectSize || brief.project_size, y);
    y = checkPageOverflow(doc, y);
    
    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    y = addMultiParagraphField(doc, "Target Audience", brief.targetAudience || brief.target_audience, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Website/App Purpose", brief.websitePurpose || brief.website_purpose, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Project Description", brief.projectDescription || brief.project_description, y);
    y = checkPageOverflow(doc, y);
    
    // Website Type Interest
    if (brief.websiteTypeInterest && brief.websiteTypeInterest.length > 0) {
      y = addField(doc, "Website Type Interest", Array.isArray(brief.websiteTypeInterest) ? brief.websiteTypeInterest.join(", ") : brief.websiteTypeInterest, y);
      y = checkPageOverflow(doc, y);
    } else if (brief.website_type_interest && brief.website_type_interest.length > 0) {
      y = addField(doc, "Website Type Interest", Array.isArray(brief.website_type_interest) ? brief.website_type_interest.join(", ") : brief.website_type_interest, y);
      y = checkPageOverflow(doc, y);
    }
    
    // Current Website
    if (brief.currentWebsite || brief.current_website) {
      y = addField(doc, "Current Website", brief.currentWebsite || brief.current_website, y);
      y = checkPageOverflow(doc, y);
    }

    // Competitors
    if (brief.competitor1 || brief.competitor2 || brief.competitor3 || brief.competitor4) {
      y = addSectionTitle(doc, "Competitors", y);
      if (brief.competitor1) y = addField(doc, "Competitor 1", brief.competitor1, y);
      if (brief.competitor2) y = addField(doc, "Competitor 2", brief.competitor2, y);
      if (brief.competitor3) y = addField(doc, "Competitor 3", brief.competitor3, y);
      if (brief.competitor4) y = addField(doc, "Competitor 4", brief.competitor4, y);
      y = checkPageOverflow(doc, y);
    }

    // Design Preferences
    y = addSectionTitle(doc, "Design Preferences", y);
    y = addMultiParagraphField(doc, "General Style", brief.generalStyle || brief.general_style, y);
    y = checkPageOverflow(doc, y);
    
    if (brief.colorPreferences || brief.color_preferences) {
      y = addMultiParagraphField(doc, "Color Preferences", brief.colorPreferences || brief.color_preferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.fontPreferences || brief.font_preferences) {
      y = addMultiParagraphField(doc, "Font Preferences", brief.fontPreferences || brief.font_preferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.existingBrandAssets || brief.existing_brand_assets) {
      y = addMultiParagraphField(doc, "Existing Brand Assets", brief.existingBrandAssets || brief.existing_brand_assets, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.stylePreferences || brief.style_preferences) {
      y = addMultiParagraphField(doc, "Style Preferences", brief.stylePreferences || brief.style_preferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    // References
    if (brief.reference1 || brief.reference2 || brief.reference3 || brief.reference4) {
      y = addSectionTitle(doc, "References", y);
      if (brief.reference1) y = addField(doc, "Reference 1", brief.reference1, y);
      if (brief.reference2) y = addField(doc, "Reference 2", brief.reference2, y);
      if (brief.reference3) y = addField(doc, "Reference 3", brief.reference3, y);
      if (brief.reference4) y = addField(doc, "Reference 4", brief.reference4, y);
      y = checkPageOverflow(doc, y);
    }

    // Brand Guidelines and Wireframes
    if (brief.hasBrandGuidelines || brief.has_brand_guidelines || brief.hasWireframe || brief.has_wireframe) {
      y = addSectionTitle(doc, "Additional Information", y);
      
      const hasBrandGuidelines = brief.hasBrandGuidelines || brief.has_brand_guidelines;
      if (hasBrandGuidelines) {
        y = addField(doc, "Has Brand Guidelines", String(hasBrandGuidelines), y);
        y = checkPageOverflow(doc, y);
        
        const brandGuidelinesDetails = brief.brandGuidelinesDetails || brief.brand_guidelines_details;
        if (brandGuidelinesDetails) {
          y = addMultiParagraphField(doc, "Brand Guidelines Details", brandGuidelinesDetails, y);
          y = checkPageOverflow(doc, y);
        }
      }
      
      const hasWireframe = brief.hasWireframe || brief.has_wireframe;
      if (hasWireframe) {
        y = addField(doc, "Has Wireframes", String(hasWireframe), y);
        y = checkPageOverflow(doc, y);
        
        const wireframeDetails = brief.wireframeDetails || brief.wireframe_details;
        if (wireframeDetails) {
          y = addMultiParagraphField(doc, "Wireframe Details", wireframeDetails, y);
          y = checkPageOverflow(doc, y);
        }
      }
    }

    // Page Details
    const pageCount = brief.pageCount || brief.page_count;
    const pageDetails = brief.pageDetails || brief.page_details;
    
    if (pageCount && pageDetails && pageDetails.length > 0) {
      y = addSectionTitle(doc, "Page Details", y);
      y = addField(doc, "Number of Pages", String(pageCount), y);
      y = checkPageOverflow(doc, y);
      
      pageDetails.forEach((page: any, index: number) => {
        if (page && (page.name || page.description)) {
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
    
    // Implementation Details
    const websiteContent = brief.websiteContent || brief.website_content;
    const developmentService = brief.developmentService || brief.development_service;
    
    if (websiteContent || developmentService) {
      y = addSectionTitle(doc, "Implementation Details", y);
      
      if (websiteContent) {
        y = addMultiParagraphField(doc, "Website Content", websiteContent, y);
        y = checkPageOverflow(doc, y);
      }
      
      if (developmentService) {
        y = addField(doc, "Development Service", developmentService, y);
        y = checkPageOverflow(doc, y);
      }
    }

    // Deadline
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
    doc.save(`UI_Design_Brief_${brief.id}.pdf`);
    console.log("PDF saved successfully for UI design brief:", brief.id);
    
    return true;
  } catch (error) {
    console.error("Error generating UI brief PDF:", error);
    throw error;
  }
};
