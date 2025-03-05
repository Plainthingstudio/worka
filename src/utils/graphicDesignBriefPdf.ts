
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

export const generateGraphicDesignBriefPDF = async (brief: any) => {
  try {
    // Log the incoming brief data for debugging
    console.log("Generating PDF with brief data:", brief);
    console.log("Logo feelings data for PDF:", brief.logoFeelings);
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "Graphic Design Brief", y);

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
    y = addMultiParagraphField(doc, "About Company", brief.aboutCompany, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Vision & Mission", brief.visionMission, y);
    y = checkPageOverflow(doc, y);
    y = addMultiParagraphField(doc, "Slogan", brief.slogan, y);
    y = checkPageOverflow(doc, y);

    // Logo Preferences
    if (brief.logoFeelings) {
      y = addSectionTitle(doc, "Logo Preferences", y);
      
      // Process each logo feeling attribute individually with page break checking after each
      if (brief.logoFeelings.gender) {
        y = addField(doc, "Feminine vs Masculine", brief.logoFeelings.gender, y);
        y = checkPageOverflow(doc, y);
      }
      
      if (brief.logoFeelings.pricing) {
        y = addField(doc, "Economical vs Luxury", brief.logoFeelings.pricing, y);
        y = checkPageOverflow(doc, y);
      }
      
      if (brief.logoFeelings.era) {
        y = addField(doc, "Modern vs Classic", brief.logoFeelings.era, y);
        y = checkPageOverflow(doc, y);
      }
      
      if (brief.logoFeelings.tone) {
        y = addField(doc, "Serious vs Playful", brief.logoFeelings.tone, y);
        y = checkPageOverflow(doc, y);
      }
      
      // Explicitly check for complexity and add with page break check
      if (brief.logoFeelings.complexity) {
        console.log("Adding complexity to PDF:", brief.logoFeelings.complexity);
        y = addField(doc, "Simple vs Complex", brief.logoFeelings.complexity, y);
        y = checkPageOverflow(doc, y);
      }
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
    if (brief.targetAge) {
      y = addField(doc, "Age Range", brief.targetAge, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.targetGender) {
      y = addField(doc, "Gender", brief.targetGender, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.targetDemography) {
      y = addField(doc, "Demography", brief.targetDemography, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.targetProfession) {
      y = addField(doc, "Profession", brief.targetProfession, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.targetPersonality) {
      y = addField(doc, "Personality", brief.targetPersonality, y);
      y = checkPageOverflow(doc, y);
    }

    // Product Information
    y = addSectionTitle(doc, "Product Information", y);
    if (brief.productsServices) {
      y = addMultiParagraphField(doc, "Products/Services", brief.productsServices, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.featuresAndBenefits) {
      y = addMultiParagraphField(doc, "Features & Benefits", brief.featuresAndBenefits, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.marketCategory) {
      y = addMultiParagraphField(doc, "Market Category", brief.marketCategory, y);
      y = checkPageOverflow(doc, y);
    }

    // Competitors
    if (brief.competitor1 || brief.competitor2 || brief.competitor3 || brief.competitor4) {
      y = addSectionTitle(doc, "Competitors", y);
      
      if (brief.competitor1) {
        y = addField(doc, "Competitor 1", brief.competitor1, y);
        y = checkPageOverflow(doc, y);
      }
      if (brief.competitor2) {
        y = addField(doc, "Competitor 2", brief.competitor2, y);
        y = checkPageOverflow(doc, y);
      }
      if (brief.competitor3) {
        y = addField(doc, "Competitor 3", brief.competitor3, y);
        y = checkPageOverflow(doc, y);
      }
      if (brief.competitor4) {
        y = addField(doc, "Competitor 4", brief.competitor4, y);
        y = checkPageOverflow(doc, y);
      }
    }

    // References
    if (brief.reference1 || brief.reference2 || brief.reference3 || brief.reference4) {
      y = addSectionTitle(doc, "References", y);
      
      if (brief.reference1) {
        y = addField(doc, "Reference 1", brief.reference1, y);
        y = checkPageOverflow(doc, y);
      }
      if (brief.reference2) {
        y = addField(doc, "Reference 2", brief.reference2, y);
        y = checkPageOverflow(doc, y);
      }
      if (brief.reference3) {
        y = addField(doc, "Reference 3", brief.reference3, y);
        y = checkPageOverflow(doc, y);
      }
      if (brief.reference4) {
        y = addField(doc, "Reference 4", brief.reference4, y);
        y = checkPageOverflow(doc, y);
      }
    }

    // Additional Information
    y = addSectionTitle(doc, "Additional Information", y);
    
    if (brief.brandPositioning) {
      y = addMultiParagraphField(doc, "Brand Positioning", brief.brandPositioning, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.barrierToEntry) {
      y = addMultiParagraphField(doc, "Barrier to Entry", brief.barrierToEntry, y);
      y = checkPageOverflow(doc, y);
    }
    if (brief.specificImagery) {
      y = addMultiParagraphField(doc, "Specific Imagery", brief.specificImagery, y);
      y = checkPageOverflow(doc, y);
    }

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
