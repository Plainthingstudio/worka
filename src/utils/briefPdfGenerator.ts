import jsPDF from "jspdf";
import { format } from "date-fns";

// Helper function to add a section title
const addSectionTitle = (doc: jsPDF, text: string, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(text, 20, y);
  doc.setLineWidth(0.2);
  doc.line(20, y + 1, 190, y + 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  return y + 10;
};

// Helper function to add a field
const addField = (doc: jsPDF, label: string, value: string | null | undefined, y: number) => {
  const safeValue = typeof value === 'string' ? value.trim() : (value || "Not provided");
  
  doc.setFont("helvetica", "bold");
  doc.text(`${label}:`, 20, y);
  doc.setFont("helvetica", "normal");
  
  // Check if we need to wrap text
  if (safeValue && safeValue.length > 80) {
    const textLines = doc.splitTextToSize(safeValue, 150);
    doc.text(textLines, 40, y);
    return y + (textLines.length * 5);
  } else {
    doc.text(safeValue, 40, y);
    return y + 6;
  }
};

// Helper function to check page overflow and add a new page if needed
const checkPageOverflow = (doc: jsPDF, y: number, margin: number = 20) => {
  if (y > 270) {
    doc.addPage();
    return margin;
  }
  return y;
};

export const generateIllustrationBriefPDF = async (brief: any) => {
  try {
    const doc = new jsPDF();
    let y = 20;

    // Add title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Illustration Design Brief", 105, y, { align: "center" });
    y += 15;

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

    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    y = addField(doc, "About Company", brief.aboutCompany, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Illustrations Purpose", brief.illustrationsPurpose, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Illustrations For", brief.illustrationsFor, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Illustrations Style", brief.illustrationsStyle, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Target Audience", brief.targetAudience, y);
    y = checkPageOverflow(doc, y);

    // References
    if (brief.reference1 || brief.reference2 || brief.reference3 || brief.reference4) {
      y = addSectionTitle(doc, "References", y);
      if (brief.reference1) y = addField(doc, "Reference 1", brief.reference1, y);
      if (brief.reference2) y = addField(doc, "Reference 2", brief.reference2, y);
      if (brief.reference3) y = addField(doc, "Reference 3", brief.reference3, y);
      if (brief.reference4) y = addField(doc, "Reference 4", brief.reference4, y);
      y = checkPageOverflow(doc, y);
    }

    // Illustration Details
    if (brief.illustrationDetails && brief.illustrationDetails.length > 0) {
      y = addSectionTitle(doc, "Illustration Details", y);
      y = addField(doc, "Number of Illustrations", brief.illustrationsCount.toString(), y);
      y = checkPageOverflow(doc, y);
      
      brief.illustrationDetails.forEach((detail: string, index: number) => {
        if (detail) {
          y = addField(doc, `Illustration ${index + 1}`, detail, y);
          y = checkPageOverflow(doc, y);
        }
      });
    }

    // Deliverables
    if (brief.deliverables && brief.deliverables.length > 0) {
      y = addSectionTitle(doc, "Deliverables", y);
      y = addField(doc, "File Formats", brief.deliverables.join(", "), y);
      y = checkPageOverflow(doc, y);
    }

    // Deadline
    y = addSectionTitle(doc, "Deadline", y);
    const deadlineValue = brief.completionDeadline 
      ? format(new Date(brief.completionDeadline), "MMMM dd, yyyy") 
      : "Not specified";
    y = addField(doc, "Completion Deadline", deadlineValue, y);

    // Save the PDF
    doc.save(`Illustration_Brief_${brief.id}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating illustration brief PDF:", error);
    throw error;
  }
};

export const generateUIDesignBriefPDF = async (brief: any) => {
  try {
    const doc = new jsPDF();
    let y = 20;

    // Add title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("UI Design Brief", 105, y, { align: "center" });
    y += 15;

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
    y = addField(doc, "About Company", brief.aboutCompany, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Type", brief.projectType, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Size", brief.projectSize, y);
    y = checkPageOverflow(doc, y);
    
    // Project Details
    y = addSectionTitle(doc, "Project Details", y);
    y = addField(doc, "Target Audience", brief.targetAudience, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Website/App Purpose", brief.websitePurpose, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Project Description", brief.projectDescription, y);
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
    y = addField(doc, "General Style", brief.generalStyle, y);
    y = checkPageOverflow(doc, y);
    
    if (brief.colorPreferences) {
      y = addField(doc, "Color Preferences", brief.colorPreferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.fontPreferences) {
      y = addField(doc, "Font Preferences", brief.fontPreferences, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.existingBrandAssets) {
      y = addField(doc, "Existing Brand Assets", brief.existingBrandAssets, y);
      y = checkPageOverflow(doc, y);
    }
    
    if (brief.stylePreferences) {
      y = addField(doc, "Style Preferences", brief.stylePreferences, y);
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
          y = addField(doc, "Brand Guidelines Details", brief.brandGuidelinesDetails, y);
          y = checkPageOverflow(doc, y);
        }
      }
      
      if (brief.hasWireframe) {
        y = addField(doc, "Has Wireframes", brief.hasWireframe, y);
        y = checkPageOverflow(doc, y);
        
        if (brief.wireframeDetails) {
          y = addField(doc, "Wireframe Details", brief.wireframeDetails, y);
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
          doc.text(`Page ${index + 1}:`, 20, y);
          doc.setFont("helvetica", "normal");
          y += 5;
          
          if (page.name) {
            y = addField(doc, "Name", page.name, y);
          }
          
          if (page.description) {
            y = addField(doc, "Description", page.description, y);
          }
          
          y = checkPageOverflow(doc, y);
        }
      });
    }
    
    // Implementation Details
    if (brief.websiteContent || brief.developmentService) {
      y = addSectionTitle(doc, "Implementation Details", y);
      
      if (brief.websiteContent) {
        y = addField(doc, "Website Content", brief.websiteContent, y);
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

export const generateGraphicDesignBriefPDF = async (brief: any) => {
  try {
    const doc = new jsPDF();
    let y = 20;

    // Add title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Graphic Design Brief", 105, y, { align: "center" });
    y += 15;

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

    // Company Information
    y = addSectionTitle(doc, "Company Information", y);
    y = addField(doc, "About Company", brief.aboutCompany, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Vision & Mission", brief.visionMission, y);
    y = checkPageOverflow(doc, y);
    y = addField(doc, "Slogan", brief.slogan, y);
    y = checkPageOverflow(doc, y);

    // Logo Preferences
    if (brief.logoFeelings) {
      y = addSectionTitle(doc, "Logo Preferences", y);
      
      if (brief.logoFeelings.style) y = addField(doc, "Style", brief.logoFeelings.style, y);
      if (brief.logoFeelings.pricing) y = addField(doc, "Pricing", brief.logoFeelings.pricing, y);
      if (brief.logoFeelings.era) y = addField(doc, "Era", brief.logoFeelings.era, y);
      if (brief.logoFeelings.tone) y = addField(doc, "Tone", brief.logoFeelings.tone, y);
      if (brief.logoFeelings.complexity) y = addField(doc, "Complexity", brief.logoFeelings.complexity, y);
      if (brief.logoFeelings.gender) y = addField(doc, "Gender", brief.logoFeelings.gender, y);
      
      y = checkPageOverflow(doc, y);
    }

    // Logo Type
    if (brief.logoType) {
      y = addField(doc, "Logo Type", brief.logoType, y);
      y = checkPageOverflow(doc, y);
    }

    // Tone
    if (brief.tone && brief.tone.length > 0) {
      y = addField(doc, "Tone", brief.tone.join(", "), y);
      y = checkPageOverflow(doc, y);
    }

    // Target Audience
    y = addSectionTitle(doc, "Target Audience", y);
    if (brief.targetAge) y = addField(doc, "Age Range", brief.targetAge, y);
    if (brief.targetGender) y = addField(doc, "Gender", brief.targetGender, y);
    if (brief.targetDemography) y = addField(doc, "Demography", brief.targetDemography, y);
    if (brief.targetProfession) y = addField(doc, "Profession", brief.targetProfession, y);
    if (brief.targetPersonality) y = addField(doc, "Personality", brief.targetPersonality, y);
    y = checkPageOverflow(doc, y);

    // Product Information
    y = addSectionTitle(doc, "Product Information", y);
    if (brief.productsServices) y = addField(doc, "Products/Services", brief.productsServices, y);
    y = checkPageOverflow(doc, y);
    if (brief.featuresAndBenefits) y = addField(doc, "Features & Benefits", brief.featuresAndBenefits, y);
    y = checkPageOverflow(doc, y);
    if (brief.marketCategory) y = addField(doc, "Market Category", brief.marketCategory, y);
    y = checkPageOverflow(doc, y);

    // Competitors
    if (brief.competitor1 || brief.competitor2 || brief.competitor3 || brief.competitor4) {
      y = addSectionTitle(doc, "Competitors", y);
      if (brief.competitor1) y = addField(doc, "Competitor 1", brief.competitor1, y);
      if (brief.competitor2) y = addField(doc, "Competitor 2", brief.competitor2, y);
      if (brief.competitor3) y = addField(doc, "Competitor 3", brief.competitor3, y);
      if (brief.competitor4) y = addField(doc, "Competitor 4", brief.competitor4, y);
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

    // Additional Information
    y = addSectionTitle(doc, "Additional Information", y);
    if (brief.brandPositioning) y = addField(doc, "Brand Positioning", brief.brandPositioning, y);
    y = checkPageOverflow(doc, y);
    if (brief.barrierToEntry) y = addField(doc, "Barrier to Entry", brief.barrierToEntry, y);
    y = checkPageOverflow(doc, y);
    if (brief.specificImagery) y = addField(doc, "Specific Imagery", brief.specificImagery, y);
    y = checkPageOverflow(doc, y);

    // Services Required
    if (brief.services && brief.services.length > 0) {
      y = addSectionTitle(doc, "Services Required", y);
      y = addField(doc, "Services", brief.services.join(", "), y);
      y = checkPageOverflow(doc, y);
    }

    // Print Media
    if (brief.printMedia && brief.printMedia.length > 0) {
      y = addSectionTitle(doc, "Print Media", y);
      y = addField(doc, "Print Media Items", brief.printMedia.join(", "), y);
      y = checkPageOverflow(doc, y);
    }

    // Digital Media
    if (brief.digitalMedia && brief.digitalMedia.length > 0) {
      y = addSectionTitle(doc, "Digital Media", y);
      y = addField(doc, "Digital Media Items", brief.digitalMedia.join(", "), y);
      y = checkPageOverflow(doc, y);
    }

    // Save the PDF
    doc.save(`Graphic_Design_Brief_${brief.id}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating graphic design brief PDF:", error);
    throw error;
  }
};
