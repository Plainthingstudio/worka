
import jsPDF from "jspdf";
import { 
  renderClientAndBriefInfo,
  renderCompanyInformation,
  renderLogoPreferences,
  renderTargetAudience,
  renderProductInformation,
  renderCompetitors,
  renderReferences,
  renderAdditionalInformation,
  renderServicesRequired
} from "./pdf/graphicDesignBriefRenderer";
import { addPdfTitle } from "./pdfUtils";

/**
 * Generates a PDF document for a graphic design brief
 */
export const generateGraphicDesignBriefPDF = async (brief: any) => {
  try {
    // Log the incoming brief data for debugging
    console.log("Generating PDF with brief data:", brief);
    
    // Make a deep copy of the brief to avoid modifying the original
    let briefCopy = JSON.parse(JSON.stringify(brief));
    
    // Normalize property names to handle both camelCase and snake_case
    briefCopy = {
      ...briefCopy,
      // Client info
      name: briefCopy.name || "",
      email: briefCopy.email || "",
      companyName: briefCopy.companyName || briefCopy.company_name || "",
      phone: briefCopy.phone || "",
      
      // Company info
      aboutCompany: briefCopy.aboutCompany || briefCopy.about_company || "",
      visionMission: briefCopy.visionMission || briefCopy.vision_mission || "",
      slogan: briefCopy.slogan || "",
      
      // Market info
      marketCategory: briefCopy.marketCategory || briefCopy.market_category || "",
      productsServices: briefCopy.productsServices || briefCopy.products_services || "",
      featuresAndBenefits: briefCopy.featuresAndBenefits || briefCopy.features_and_benefits || "",
      brandPositioning: briefCopy.brandPositioning || briefCopy.brand_positioning || "",
      barrierToEntry: briefCopy.barrierToEntry || briefCopy.barrier_to_entry || "",
      
      // Target audience
      targetAge: briefCopy.targetAge || briefCopy.target_age || "",
      targetGender: briefCopy.targetGender || briefCopy.target_gender || "",
      targetDemography: briefCopy.targetDemography || briefCopy.target_demography || "",
      targetProfession: briefCopy.targetProfession || briefCopy.target_profession || "",
      targetPersonality: briefCopy.targetPersonality || briefCopy.target_personality || "",
      
      // Logo preferences
      logoType: briefCopy.logoType || briefCopy.logo_type || "",
      
      // Competitors & references
      competitor1: briefCopy.competitor1 || "",
      competitor2: briefCopy.competitor2 || "",
      competitor3: briefCopy.competitor3 || "",
      competitor4: briefCopy.competitor4 || "",
      reference1: briefCopy.reference1 || "",
      reference2: briefCopy.reference2 || "",
      reference3: briefCopy.reference3 || "",
      reference4: briefCopy.reference4 || "",
      specificImagery: briefCopy.specificImagery || briefCopy.specific_imagery || "",
      
      // Services & media
      services: briefCopy.services || [],
      printMedia: briefCopy.printMedia || briefCopy.print_media || [],
      digitalMedia: briefCopy.digitalMedia || briefCopy.digital_media || [],
      
      // Meta
      submissionDate: briefCopy.submissionDate || briefCopy.submission_date || new Date().toISOString(),
      status: briefCopy.status || "New"
    };
    
    // Process logo feelings if it exists
    let logoFeelings = briefCopy.logoFeelings || briefCopy.logo_feelings || null;
    
    // If logoFeelings is a string, try to parse it
    if (typeof logoFeelings === 'string') {
      try {
        logoFeelings = JSON.parse(logoFeelings);
        console.log("Successfully parsed logoFeelings string in main PDF generator:", logoFeelings);
      } catch (e) {
        console.error("Failed to parse logoFeelings string in main PDF generator:", e);
        // Instead of setting to null, set to empty object
        logoFeelings = {};
      }
    } else if (!logoFeelings || typeof logoFeelings !== 'object') {
      // Ensure logoFeelings is at least an empty object
      logoFeelings = {};
    }
    
    // Update the brief with the processed logoFeelings
    briefCopy.logoFeelings = logoFeelings;
    briefCopy.logo_feelings = logoFeelings; // Set both versions to ensure compatibility
    
    console.log("Logo feelings data prepared for PDF:", briefCopy.logoFeelings);
    
    const doc = new jsPDF();
    let y = 20;

    // Add title
    y = addPdfTitle(doc, "Graphic Design Brief", y);

    // Render all sections of the PDF using the specialized renderer functions
    y = renderClientAndBriefInfo(doc, briefCopy, y);
    y = renderCompanyInformation(doc, briefCopy, y);
    y = renderLogoPreferences(doc, briefCopy, y);
    y = renderTargetAudience(doc, briefCopy, y);
    y = renderProductInformation(doc, briefCopy, y);
    y = renderCompetitors(doc, briefCopy, y);
    y = renderReferences(doc, briefCopy, y);
    y = renderAdditionalInformation(doc, briefCopy, y);
    y = renderServicesRequired(doc, briefCopy, y);

    // Save the PDF
    doc.save(`Graphic_Design_Brief_${briefCopy.id || 'download'}.pdf`);
    console.log("PDF saved successfully for graphic design brief:", briefCopy.id);
    
    return true;
  } catch (error) {
    console.error("Error generating graphic design brief PDF:", error);
    throw error;
  }
};
