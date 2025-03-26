
import { format } from "date-fns";

export const generateUIDesignBriefHtml = (briefData: any): string => {
  // Helper function to safely get values from brief data
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
  
  // Helper to get website type interests (only selected ones)
  const getWebsiteTypeInterests = () => {
    let interests = briefData.websiteTypeInterest || briefData.website_type_interest;
    
    // If it doesn't exist, return empty array
    if (!interests) return [];
    
    // If it's already an array, return it
    if (Array.isArray(interests)) return interests;
    
    // If it's a string (JSON), try to parse it
    if (typeof interests === 'string') {
      try {
        interests = JSON.parse(interests);
      } catch (e) {
        console.error("Failed to parse website type interests:", e);
        return [];
      }
    }
    
    // If it's an object with boolean values (form checkboxes)
    if (typeof interests === 'object' && interests !== null) {
      return Object.entries(interests)
        .filter(([_, selected]) => selected === true)
        .map(([key]) => {
          // Format the key
          return key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        });
    }
    
    return [];
  };
  
  // Helper to safely get page details
  const getPageDetails = () => {
    let details = briefData.pageDetails || briefData.page_details || [];
    
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch {
        return [];
      }
    }
    
    // Ensure details is an array
    return Array.isArray(details) ? details : 
          details && typeof details === 'object' ? [details] : [];
  };
  
  // Get formatted deadline if exists
  const getFormattedDeadline = () => {
    const deadlineValue = getValue("completionDeadline", "completion_deadline");
    if (deadlineValue && deadlineValue !== "Not provided") {
      try {
        const deadlineDate = new Date(deadlineValue);
        if (!isNaN(deadlineDate.getTime())) {
          return format(deadlineDate, "MMMM d, yyyy");
        }
      } catch (e) {
        console.error("Error formatting deadline:", e);
      }
    }
    return "Not provided";
  };
  
  // Get website type interests as HTML
  const websiteTypeInterestsHtml = () => {
    const interests = getWebsiteTypeInterests();
    if (interests.length === 0) return '';
    
    return `
      <div class="info-section">
        <h3>Website/App Type Interest</h3>
        <p>${interests.join(", ")}</p>
      </div>
    `;
  };
  
  // Generate page details as HTML table
  const pageDetailsHtml = () => {
    const pageDetails = getPageDetails();
    if (pageDetails.length === 0) return '';
    
    let tableRows = '';
    pageDetails.forEach((detail: any) => {
      const name = detail?.name || detail?.page_name || "Unnamed Page";
      const description = detail?.description || detail?.page_description || "No description provided";
      
      tableRows += `
        <tr>
          <td class="border p-2">${name}</td>
          <td class="border p-2">${description}</td>
        </tr>
      `;
    });
    
    return `
      <div class="info-section">
        <h3>Page Details</h3>
        <table class="border-collapse w-full">
          <thead>
            <tr>
              <th class="border p-2 text-left">Page Name</th>
              <th class="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  };
  
  // Generate references as HTML
  const referencesHtml = () => {
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
  
  // Generate competitors as HTML
  const competitorsHtml = () => {
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
  
  // Create the HTML structure for the brief
  const html = `
    <html>
      <head>
        <title>UI Design Brief</title>
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
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
          }
        </style>
      </head>
      <body>
        <div class="brief-container">
          <h1>UI Design Brief</h1>
          
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
          
          <h2>Project Information</h2>
          <div class="info-section">
            <h3>Project Type</h3>
            <p>${getValue("projectType", "project_type")}</p>
          </div>
          <div class="info-section">
            <h3>Project Size</h3>
            <p>${getValue("projectSize", "project_size")}</p>
          </div>
          <div class="info-section">
            <h3>Current Website</h3>
            <p>${getValue("currentWebsite", "current_website")}</p>
          </div>
          ${websiteTypeInterestsHtml()}
          <div class="info-section">
            <h3>Website Purpose</h3>
            <p>${getValue("websitePurpose", "website_purpose")}</p>
          </div>
          
          <h2>Company & Target Audience</h2>
          <div class="info-section">
            <h3>About Company</h3>
            <p>${getValue("aboutCompany", "about_company")}</p>
          </div>
          <div class="info-section">
            <h3>Target Audience</h3>
            <p>${getValue("targetAudience", "target_audience")}</p>
          </div>
          
          <h2>Brand & Design</h2>
          <div class="info-section">
            <h3>Existing Brand Assets</h3>
            <p>${getValue("existingBrandAssets", "existing_brand_assets")}</p>
          </div>
          <div class="info-section">
            <h3>Brand Guidelines</h3>
            <p>${getValue("hasBrandGuidelines", "has_brand_guidelines")}</p>
          </div>
          ${getValue("hasBrandGuidelines", "has_brand_guidelines") === "Yes" ? `
            <div class="info-section">
              <h3>Guidelines Details</h3>
              <p>${getValue("brandGuidelinesDetails", "brand_guidelines_details")}</p>
            </div>
          ` : ''}
          <div class="info-section">
            <h3>Wireframe Status</h3>
            <p>${getValue("hasWireframe", "has_wireframe")}</p>
          </div>
          ${getValue("hasWireframe", "has_wireframe") === "Yes" ? `
            <div class="info-section">
              <h3>Wireframe Details</h3>
              <p>${getValue("wireframeDetails", "wireframe_details")}</p>
            </div>
          ` : ''}
          
          <h2>Design Preferences</h2>
          <div class="info-section">
            <h3>General Style</h3>
            <p>${getValue("generalStyle", "general_style")}</p>
          </div>
          <div class="info-section">
            <h3>Color Preferences</h3>
            <p>${getValue("colorPreferences", "color_preferences")}</p>
          </div>
          <div class="info-section">
            <h3>Font Preferences</h3>
            <p>${getValue("fontPreferences", "font_preferences")}</p>
          </div>
          <div class="info-section">
            <h3>Style Preferences</h3>
            <p>${getValue("stylePreferences", "style_preferences")}</p>
          </div>
          
          ${referencesHtml()}
          ${competitorsHtml()}
          
          <h2>Page Information</h2>
          <div class="info-section">
            <h3>Number of Pages</h3>
            <p>${getValue("pageCount", "page_count")}</p>
          </div>
          ${pageDetailsHtml()}
          
          <h2>Project Delivery</h2>
          <div class="info-section">
            <h3>Website Content</h3>
            <p>${getValue("websiteContent", "website_content")}</p>
          </div>
          <div class="info-section">
            <h3>Development Service</h3>
            <p>${getValue("developmentService", "development_service")}</p>
          </div>
          <div class="info-section">
            <h3>Completion Deadline</h3>
            <p>${getFormattedDeadline()}</p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  return html;
};
