
import jsPDF from "jspdf";
import { format } from "date-fns";
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
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "UI Design Brief", y);

    // Client Information
    y = addSectionTitle(doc, "Client Information", y);
    y = addField(doc, "Name", brief.name, y);
    y = addField(doc, "Email", brief.email, y);
    y = addField(doc, "Company", brief.companyName, y);
    y = checkPageOverflow(doc, y);

    // Brief Information
    y = addSectionTitle(doc, "Brief Information", y);
    y = addField(doc, "Submission Date", format(new Date(brief.submissionDate), "MMMM dd, yyyy"), y);
    y = addField(doc, "Status", brief.status, y);
    y = checkPageOverflow(doc, y);

    // Project Overview
    y = addSectionTitle(doc, "Project Overview", y);
    y = addMultiParagraphField(doc, "About Company", brief.aboutCompany, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Type", brief.projectType, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Size", brief.projectSize, y);
    y = checkPageOverflow(doc, y);
    
    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    y = addMultiParagraphField(doc, "Target Audience", brief.targetAudience, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Website/App Purpose", brief.websitePurpose, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Project Description", brief.projectDescription, y);
    y = checkPageOverflow(doc, y);
    
    // Website Type Interest
    if (brief.websiteTypeInterest && brief.websiteTypeInterest.length > 0) {
      y = addField(doc, "Website Type Interest", brief.websiteTypeInterest.join(", "), y);
      y = checkPageOverflow(doc, y);
    }
    
    // Current Website
    if (brief.currentWebsite) {
      y = addField(doc, "Current Website", brief.currentWebsite, y);
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
    y = addMultiParagraphField(doc, "General Style", brief.generalStyle, y);
    y = checkPageOverflow(doc, y);
    
    if (brief.colorPreferences) {
      y = addMultiParagraphField(doc, "Color Preferences", brief.colorPreferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.fontPreferences) {
      y = addMultiParagraphField(doc, "Font Preferences", brief.fontPreferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.existingBrandAssets) {
      y = addMultiParagraphField(doc, "Existing Brand Assets", brief.existingBrandAssets, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.stylePreferences) {
      y = addMultiParagraphField(doc, "Style Preferences", brief.stylePreferences, y);
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
    if (brief.hasBrandGuidelines || brief.hasWireframe) {
      y = addSectionTitle(doc, "Additional Information", y);
      
      if (brief.hasBrandGuidelines) {
        y = addField(doc, "Has Brand Guidelines", brief.hasBrandGuidelines, y);
        y = checkPageOverflow(doc, y);
        
        if (brief.brandGuidelinesDetails) {
          y = addMultiParagraphField(doc, "Brand Guidelines Details", brief.brandGuidelinesDetails, y);
          y = checkPageOverflow(doc, y);
        }
      }
      
      if (brief.hasWireframe) {
        y = addField(doc, "Has Wireframes", brief.hasWireframe, y);
        y = checkPageOverflow(doc, y);
        
        if (brief.wireframeDetails) {
          y = addMultiParagraphField(doc, "Wireframe Details", brief.wireframeDetails, y);
          y = checkPageOverflow(doc, y);
        }
      }
    }

    // Page Details
    if (brief.pageCount && brief.pageDetails && brief.pageDetails.length > 0) {
      y = addSectionTitle(doc, "Page Details", y);
      y = addField(doc, "Number of Pages", brief.pageCount.toString(), y);
      y = checkPageOverflow(doc, y);
      
      brief.pageDetails.forEach((page: any, index: number) => {
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
    if (brief.websiteContent || brief.developmentService) {
      y = addSectionTitle(doc, "Implementation Details", y);
      
      if (brief.websiteContent) {
        y = addMultiParagraphField(doc, "Website Content", brief.websiteContent, y);
        y = checkPageOverflow(doc, y);
      }
      
      if (brief.developmentService) {
        y = addField(doc, "Development Service", brief.developmentService, y);
        y = checkPageOverflow(doc, y);
      }
    }

    // Deadline
    y = addSectionTitle(doc, "Deadline", y);
    const deadlineValue = brief.completionDeadline 
      ? format(new Date(brief.completionDeadline), "MMMM dd, yyyy") 
      : "Not specified";
    y = addField(doc, "Completion Deadline", deadlineValue, y);

    // Save the PDF
    doc.save(`UI_Design_Brief_${brief.id}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating UI brief PDF:", error);
    throw error;
  }
};
