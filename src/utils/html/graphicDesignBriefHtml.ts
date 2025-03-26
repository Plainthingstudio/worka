
import { format, isValid, parseISO } from "date-fns";

export const generateGraphicDesignBriefHtml = (briefData: any): string => {
  // Make a deep copy of the brief data to avoid modifying the original
  let briefCopy = JSON.parse(JSON.stringify(briefData));
  
  // Helper function to safely get values
  const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue: any = "Not provided") => {
    const value = briefCopy[camelCaseKey] !== undefined 
      ? briefCopy[camelCaseKey] 
      : briefCopy[snakeCaseKey] !== undefined 
        ? briefCopy[snakeCaseKey] 
        : defaultValue;
    
    if (value === null || value === undefined || value === "" || 
        (Array.isArray(value) && value.length === 0)) {
      return defaultValue;
    }
    
    // Ensure we return a string
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    
    return String(value);
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
  
  // Process logo feelings to get readable values
  const processLogoFeelings = () => {
    let logoFeelings = briefCopy.logoFeelings || briefCopy.logo_feelings || null;
    
    // If logoFeelings is a string, try to parse it
    if (typeof logoFeelings === 'string') {
      try {
        logoFeelings = JSON.parse(logoFeelings);
      } catch (e) {
        console.error("Failed to parse logoFeelings string:", e);
        logoFeelings = {};
      }
    } else if (!logoFeelings || typeof logoFeelings !== 'object') {
      // Ensure logoFeelings is at least an empty object
      logoFeelings = {};
    }
    
    return {
      gender: logoFeelings.gender || "Not specified",
      pricing: logoFeelings.pricing || "Not specified",
      era: logoFeelings.era || "Not specified",
      tone: logoFeelings.tone || "Not specified",
      complexity: logoFeelings.complexity || "Not specified"
    };
  };
  
  // Process logo feelings
  const logoFeelings = processLogoFeelings();
  
  // Generate competitors HTML
  const generateCompetitorsHTML = () => {
    const competitors = [];
    for (let i = 1; i <= 4; i++) {
      const competitor = getValue(`competitor${i}`, `competitor${i}`);
      if (competitor !== "Not provided") {
        competitors.push(competitor);
      }
    }
    
    if (competitors.length === 0) return '';
    
    let competitorsContent = '';
    competitors.forEach((comp, idx) => {
      competitorsContent += `<p>${idx + 1}. ${comp}</p>`;
    });
    
    return `
      <div class="info-section">
        <h3>Competitors</h3>
        ${competitorsContent}
      </div>
    `;
  };
  
  // Generate references HTML
  const generateReferencesHTML = () => {
    const references = [];
    for (let i = 1; i <= 4; i++) {
      const reference = getValue(`reference${i}`, `reference${i}`);
      if (reference !== "Not provided") {
        references.push(reference);
      }
    }
    
    if (references.length === 0) return '';
    
    let referencesContent = '';
    references.forEach((ref, idx) => {
      referencesContent += `<p>${idx + 1}. ${ref}</p>`;
    });
    
    return `
      <div class="info-section">
        <h3>References</h3>
        ${referencesContent}
      </div>
    `;
  };
  
  // Generate services HTML
  const generateServicesHTML = () => {
    const services = briefCopy.services || [];
    if (!Array.isArray(services) || services.length === 0) return '';
    
    return `
      <div class="info-section">
        <h3>Services Required</h3>
        <p>${services.join(", ")}</p>
      </div>
    `;
  };
  
  // Generate print media HTML
  const generatePrintMediaHTML = () => {
    const printMedia = briefCopy.printMedia || briefCopy.print_media || [];
    if (!Array.isArray(printMedia) || printMedia.length === 0) return '';
    
    return `
      <div class="info-section">
        <h3>Print Media</h3>
        <p>${printMedia.join(", ")}</p>
      </div>
    `;
  };
  
  // Generate digital media HTML
  const generateDigitalMediaHTML = () => {
    const digitalMedia = briefCopy.digitalMedia || briefCopy.digital_media || [];
    if (!Array.isArray(digitalMedia) || digitalMedia.length === 0) return '';
    
    return `
      <div class="info-section">
        <h3>Digital Media</h3>
        <p>${digitalMedia.join(", ")}</p>
      </div>
    `;
  };
  
  // Create the HTML structure for the brief
  const html = `
    <html>
      <head>
        <title>Graphic Design Brief</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .brief-container {
            border: 1px solid #ddd;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
            text-align: center;
            color: #2563eb;
            margin-bottom: 30px;
          }
          h2 {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 5px;
            margin-top: 25px;
            color: #2563eb;
          }
          h3 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .info-section {
            margin-bottom: 15px;
          }
          p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="brief-container">
          <h1>Graphic Design Brief</h1>
          
          <h2>Client Information</h2>
          <div class="info-section">
            <h3>Name</h3>
            <p>${getValue("name", "name")}</p>
          </div>
          <div class="info-section">
            <h3>Email</h3>
            <p>${getValue("email", "email")}</p>
          </div>
          <div class="info-section">
            <h3>Company</h3>
            <p>${getValue("companyName", "company_name")}</p>
          </div>
          
          <h2>Brief Information</h2>
          <div class="info-section">
            <h3>Submission Date</h3>
            <p>${formatDate(getValue("submissionDate", "submission_date"))}</p>
          </div>
          <div class="info-section">
            <h3>Status</h3>
            <p>${getValue("status", "status")}</p>
          </div>
          
          <h2>Company Information</h2>
          <div class="info-section">
            <h3>About Company</h3>
            <p>${getValue("aboutCompany", "about_company")}</p>
          </div>
          <div class="info-section">
            <h3>Vision & Mission</h3>
            <p>${getValue("visionMission", "vision_mission")}</p>
          </div>
          <div class="info-section">
            <h3>Slogan</h3>
            <p>${getValue("slogan", "slogan")}</p>
          </div>
          
          <h2>Logo Preferences</h2>
          <div class="info-section">
            <h3>Feminine vs Masculine</h3>
            <p>${logoFeelings.gender}</p>
          </div>
          <div class="info-section">
            <h3>Economical vs Luxury</h3>
            <p>${logoFeelings.pricing}</p>
          </div>
          <div class="info-section">
            <h3>Modern vs Classic</h3>
            <p>${logoFeelings.era}</p>
          </div>
          <div class="info-section">
            <h3>Serious vs Playful</h3>
            <p>${logoFeelings.tone}</p>
          </div>
          <div class="info-section">
            <h3>Simple vs Complex</h3>
            <p>${logoFeelings.complexity}</p>
          </div>
          <div class="info-section">
            <h3>Logo Type</h3>
            <p>${getValue("logoType", "logo_type")}</p>
          </div>
          
          <h2>Target Audience</h2>
          <div class="info-section">
            <h3>Age Range</h3>
            <p>${getValue("targetAge", "target_age")}</p>
          </div>
          <div class="info-section">
            <h3>Gender</h3>
            <p>${getValue("targetGender", "target_gender")}</p>
          </div>
          <div class="info-section">
            <h3>Demography</h3>
            <p>${getValue("targetDemography", "target_demography")}</p>
          </div>
          <div class="info-section">
            <h3>Profession</h3>
            <p>${getValue("targetProfession", "target_profession")}</p>
          </div>
          <div class="info-section">
            <h3>Personality</h3>
            <p>${getValue("targetPersonality", "target_personality")}</p>
          </div>
          
          <h2>Product Information</h2>
          <div class="info-section">
            <h3>Products/Services</h3>
            <p>${getValue("productsServices", "products_services")}</p>
          </div>
          <div class="info-section">
            <h3>Features & Benefits</h3>
            <p>${getValue("featuresAndBenefits", "features_and_benefits")}</p>
          </div>
          <div class="info-section">
            <h3>Market Category</h3>
            <p>${getValue("marketCategory", "market_category")}</p>
          </div>
          
          ${generateCompetitorsHTML()}
          ${generateReferencesHTML()}
          
          <h2>Additional Information</h2>
          <div class="info-section">
            <h3>Brand Positioning</h3>
            <p>${getValue("brandPositioning", "brand_positioning")}</p>
          </div>
          <div class="info-section">
            <h3>Barrier to Entry</h3>
            <p>${getValue("barrierToEntry", "barrier_to_entry")}</p>
          </div>
          <div class="info-section">
            <h3>Specific Imagery</h3>
            <p>${getValue("specificImagery", "specific_imagery")}</p>
          </div>
          
          <h2>Deliverables</h2>
          ${generateServicesHTML()}
          ${generatePrintMediaHTML()}
          ${generateDigitalMediaHTML()}
        </div>
      </body>
    </html>
  `;
  
  return html;
};
