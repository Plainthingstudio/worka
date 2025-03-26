
import { format, isValid, parseISO } from "date-fns";

export const generateIllustrationBriefHtml = (briefData: any): string => {
  // Helper function to safely get values
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
    
    // Convert arrays and objects to strings
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    
    // Ensure we return a string
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
  
  // Helper to handle illustration details which could be an array or object
  const getIllustrationDetails = () => {
    const details = getValue("illustrationDetails", "illustration_details", []);
    return Array.isArray(details) ? details : 
           details && typeof details === 'object' ? [details] : [];
  };
  
  // Helper to get deliverables in readable format
  const getDeliverables = () => {
    const deliverables = getValue("deliverables", "deliverables");
    
    if (Array.isArray(deliverables)) {
      return deliverables.join(", ");
    } else if (typeof deliverables === 'string') {
      return deliverables;
    } else if (typeof deliverables === 'object' && deliverables !== null) {
      // If it's an object with file format properties
      const formats = Object.entries(deliverables)
        .filter(([_, isSelected]) => isSelected === true)
        .map(([key, _]) => key);
      
      return formats.length > 0 ? formats.join(", ") : "Not provided";
    }
    
    return "Not provided";
  };
  
  // Generate references HTML
  const generateReferencesHTML = () => {
    const references = [];
    if (getValue("reference1", "reference1") !== "Not provided") references.push(getValue("reference1", "reference1"));
    if (getValue("reference2", "reference2") !== "Not provided") references.push(getValue("reference2", "reference2"));
    if (getValue("reference3", "reference3") !== "Not provided") references.push(getValue("reference3", "reference3"));
    if (getValue("reference4", "reference4") !== "Not provided") references.push(getValue("reference4", "reference4"));
    
    if (references.length === 0) return '';
    
    let referencesContent = '';
    references.forEach((ref, idx) => {
      referencesContent += `<p>${idx + 1}. ${ref}</p>`;
    });
    
    return `
      <div class="info-section">
        <h3>Design References</h3>
        ${referencesContent}
      </div>
    `;
  };
  
  // Generate competitors HTML
  const generateCompetitorsHTML = () => {
    const competitors = [];
    if (getValue("competitor1", "competitor1") !== "Not provided") competitors.push(getValue("competitor1", "competitor1"));
    if (getValue("competitor2", "competitor2") !== "Not provided") competitors.push(getValue("competitor2", "competitor2"));
    if (getValue("competitor3", "competitor3") !== "Not provided") competitors.push(getValue("competitor3", "competitor3"));
    if (getValue("competitor4", "competitor4") !== "Not provided") competitors.push(getValue("competitor4", "competitor4"));
    
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
  
  // Generate illustration details HTML
  const generateIllustrationDetailsHTML = () => {
    const details = getIllustrationDetails();
    if (details.length === 0) return '';
    
    let detailsContent = '';
    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      detailsContent += `
        <div class="info-section">
          <h3>Illustration ${i + 1}</h3>
          <p>${detail}</p>
        </div>
      `;
    }
    
    return `
      <h2>Illustration Details</h2>
      ${detailsContent}
    `;
  };
  
  // Create the HTML structure for the brief
  const html = `
    <html>
      <head>
        <title>Illustration Design Brief</title>
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
          <h1>Illustration Design Brief</h1>
          
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
          ${getValue("phone", "phone") !== "Not provided" ? `
            <div class="info-section">
              <h3>Phone</h3>
              <p>${getValue("phone", "phone")}</p>
            </div>
          ` : ''}
          
          <h2>Submission Details</h2>
          <div class="info-section">
            <h3>Submitted</h3>
            <p>${formatDate(getValue("submissionDate", "submission_date"))}</p>
          </div>
          <div class="info-section">
            <h3>Status</h3>
            <p>${getValue("status", "status")}</p>
          </div>
          
          <h2>Project Information</h2>
          <div class="info-section">
            <h3>About Company</h3>
            <p>${getValue("aboutCompany", "about_company")}</p>
          </div>
          <div class="info-section">
            <h3>Illustrations Purpose</h3>
            <p>${getValue("illustrationsPurpose", "illustrations_purpose")}</p>
          </div>
          <div class="info-section">
            <h3>Illustrations For</h3>
            <p>${getValue("illustrationsFor", "illustrations_for")}</p>
          </div>
          <div class="info-section">
            <h3>Target Audience</h3>
            <p>${getValue("targetAudience", "target_audience")}</p>
          </div>
          
          <h2>Design Preferences</h2>
          <div class="info-section">
            <h3>Illustrations Style</h3>
            <p>${getValue("illustrationsStyle", "illustrations_style")}</p>
          </div>
          <div class="info-section">
            <h3>Brand Guidelines</h3>
            <p>${getValue("brandGuidelines", "brand_guidelines")}</p>
          </div>
          <div class="info-section">
            <h3>General Style</h3>
            <p>${getValue("generalStyle", "general_style")}</p>
          </div>
          <div class="info-section">
            <h3>Color Preferences</h3>
            <p>${getValue("colorPreferences", "color_preferences")}</p>
          </div>
          <div class="info-section">
            <h3>Likes/Dislikes in Design</h3>
            <p>${getValue("likeDislikeDesign", "like_dislike_design")}</p>
          </div>
          <div class="info-section">
            <h3>File Formats</h3>
            <p>${getDeliverables()}</p>
          </div>
          <div class="info-section">
            <h3>Number of Illustrations</h3>
            <p>${getValue("illustrationsCount", "illustrations_count")}</p>
          </div>
          
          ${generateCompetitorsHTML()}
          ${generateReferencesHTML()}
          ${generateIllustrationDetailsHTML()}
          
          ${formatDate(getValue("completionDeadline", "completion_deadline")) !== "Not provided" ? `
            <h2>Project Timeline</h2>
            <div class="info-section">
              <h3>Completion Deadline</h3>
              <p>${formatDate(getValue("completionDeadline", "completion_deadline"))}</p>
            </div>
          ` : ''}
        </div>
      </body>
    </html>
  `;
  
  return html;
};
