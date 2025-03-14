
import jsPDF from "jspdf";
import { format, isValid, parseISO } from "date-fns";
import { 
  addSectionTitle, 
  addField, 
  checkPageOverflow, 
  addPdfTitle, 
  addMultiParagraphField,
  addSeparator 
} from "../pdfUtils";

/**
 * Renders the client and brief information section of the PDF
 */
export const renderClientAndBriefInfo = (doc: jsPDF, brief: any, y: number): number => {
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

  return y;
};

/**
 * Renders the company information section of the PDF
 */
export const renderCompanyInformation = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Company Information", y);
  y = addMultiParagraphField(doc, "About Company", brief.aboutCompany || brief.about_company, y);
  y = checkPageOverflow(doc, y);
  y = addMultiParagraphField(doc, "Vision & Mission", brief.visionMission || brief.vision_mission, y);
  y = checkPageOverflow(doc, y);
  y = addMultiParagraphField(doc, "Slogan", brief.slogan, y);
  y = checkPageOverflow(doc, y);

  return y;
};

/**
 * Renders the logo preferences section of the PDF
 */
export const renderLogoPreferences = (doc: jsPDF, brief: any, y: number): number => {
  // Accessing logoFeelings from both possible structures and ensuring it exists
  const logoFeelings = brief.logoFeelings || brief.logo_feelings || {};
  
  y = addSectionTitle(doc, "Logo Preferences", y);
  
  // Process each logo feeling attribute individually with page break checking after each
  // Explicitly check each property of logoFeelings
  if (logoFeelings.gender) {
    y = addField(doc, "Feminine vs Masculine", logoFeelings.gender, y);
    y = checkPageOverflow(doc, y);
  }
  
  if (logoFeelings.pricing) {
    y = addField(doc, "Economical vs Luxury", logoFeelings.pricing, y);
    y = checkPageOverflow(doc, y);
  }
  
  if (logoFeelings.era) {
    y = addField(doc, "Modern vs Classic", logoFeelings.era, y);
    y = checkPageOverflow(doc, y);
  }
  
  if (logoFeelings.tone) {
    y = addField(doc, "Serious vs Playful", logoFeelings.tone, y);
    y = checkPageOverflow(doc, y);
  }
  
  // Logo Type
  const logoType = brief.logoType || brief.logo_type;
  if (logoType) {
    y = addField(doc, "Logo Type", logoType, y);
    y = checkPageOverflow(doc, y);
  }

  return y;
};

/**
 * Renders the target audience section of the PDF
 */
export const renderTargetAudience = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Target Audience", y);
  if (brief.targetAge || brief.target_age) {
    y = addField(doc, "Age Range", brief.targetAge || brief.target_age, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetGender || brief.target_gender) {
    y = addField(doc, "Gender", brief.targetGender || brief.target_gender, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetDemography || brief.target_demography) {
    y = addField(doc, "Demography", brief.targetDemography || brief.target_demography, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetProfession || brief.target_profession) {
    y = addField(doc, "Profession", brief.targetProfession || brief.target_profession, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.targetPersonality || brief.target_personality) {
    y = addField(doc, "Personality", brief.targetPersonality || brief.target_personality, y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};

/**
 * Renders the product information section of the PDF
 */
export const renderProductInformation = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Product Information", y);
  if (brief.productsServices || brief.products_services) {
    y = addMultiParagraphField(doc, "Products/Services", brief.productsServices || brief.products_services, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.featuresAndBenefits || brief.features_and_benefits) {
    y = addMultiParagraphField(doc, "Features & Benefits", brief.featuresAndBenefits || brief.features_and_benefits, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.marketCategory || brief.market_category) {
    y = addMultiParagraphField(doc, "Market Category", brief.marketCategory || brief.market_category, y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};

/**
 * Renders the competitors section of the PDF
 */
export const renderCompetitors = (doc: jsPDF, brief: any, y: number): number => {
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
  
  return y;
};

/**
 * Renders the references section of the PDF
 */
export const renderReferences = (doc: jsPDF, brief: any, y: number): number => {
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
  
  return y;
};

/**
 * Renders the additional information section of the PDF
 */
export const renderAdditionalInformation = (doc: jsPDF, brief: any, y: number): number => {
  y = addSectionTitle(doc, "Additional Information", y);
  
  if (brief.brandPositioning || brief.brand_positioning) {
    y = addMultiParagraphField(doc, "Brand Positioning", brief.brandPositioning || brief.brand_positioning, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.barrierToEntry || brief.barrier_to_entry) {
    y = addMultiParagraphField(doc, "Barrier to Entry", brief.barrierToEntry || brief.barrier_to_entry, y);
    y = checkPageOverflow(doc, y);
  }
  if (brief.specificImagery || brief.specific_imagery) {
    y = addMultiParagraphField(doc, "Specific Imagery", brief.specificImagery || brief.specific_imagery, y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};

/**
 * Renders the services required section of the PDF
 */
export const renderServicesRequired = (doc: jsPDF, brief: any, y: number): number => {
  // Services Required
  const services = brief.services;
  if (services && Array.isArray(services) && services.length > 0) {
    y = addSectionTitle(doc, "Services Required", y);
    y = addField(doc, "Services", services.join(", "), y);
    y = checkPageOverflow(doc, y);
  }

  // Print Media
  const printMedia = brief.printMedia || brief.print_media;
  if (printMedia && Array.isArray(printMedia) && printMedia.length > 0) {
    y = addSectionTitle(doc, "Print Media", y);
    y = addField(doc, "Print Media Items", printMedia.join(", "), y);
    y = checkPageOverflow(doc, y);
  }

  // Digital Media
  const digitalMedia = brief.digitalMedia || brief.digital_media;
  if (digitalMedia && Array.isArray(digitalMedia) && digitalMedia.length > 0) {
    y = addSectionTitle(doc, "Digital Media", y);
    y = addField(doc, "Digital Media Items", digitalMedia.join(", "), y);
    y = checkPageOverflow(doc, y);
  }
  
  return y;
};
