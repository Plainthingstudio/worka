
import React from "react";
import { format, isValid, parseISO } from "date-fns";

interface PageDetail {
  name: string;
  description: string;
}

interface UIDesignBriefDetailsProps {
  briefDetails: any;
}

const UIDesignBriefDetails: React.FC<UIDesignBriefDetailsProps> = ({ briefDetails }) => {
  console.log("UI design brief details:", briefDetails);

  // Helper function to safely format dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "Not provided";
    
    try {
      const dateObj = typeof dateValue === 'string' 
        ? parseISO(dateValue) 
        : new Date(dateValue);
      
      if (isValid(dateObj)) {
        return format(dateObj, "MMMM d, yyyy");
      }
      return "Invalid date";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Not provided";
    }
  };

  // Helper function to handle both camelCase and snake_case field access
  const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not provided") => {
    if (!briefDetails) return defaultValue;
    
    const value = briefDetails[camelCaseKey] !== undefined ? briefDetails[camelCaseKey] : 
                 briefDetails[snakeCaseKey] !== undefined ? briefDetails[snakeCaseKey] : 
                 defaultValue;
    
    // Check if value is null, undefined, empty string, or empty array
    if (value === null || value === undefined || value === "" || 
        (Array.isArray(value) && value.length === 0)) {
      return defaultValue;
    }
    
    return value;
  };

  // Helper function to get website type interest as a string of selected options only
  const getWebsiteTypeInterest = () => {
    const interestObj = getValue("websiteTypeInterest", "website_type_interest", {});
    
    // If it's already a string (for backward compatibility)
    if (typeof interestObj === 'string') return interestObj;
    
    // If it's an array, join the values
    if (Array.isArray(interestObj)) {
      return interestObj.join(", ");
    }
    
    // If it's an object with boolean values (checkbox selections)
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
        .filter(([_, isSelected]) => isSelected)
        .map(([key, _]) => websiteTypes[key] || key);
      
      return selectedTypes.length > 0 ? selectedTypes.join(", ") : "Not provided";
    }
    
    return "Not provided";
  };

  // Helper to check if any competitor is provided
  const hasCompetitors = () => {
    return Boolean(
      getValue("competitor1", "competitor1", "") !== "Not provided" || 
      getValue("competitor2", "competitor2", "") !== "Not provided" || 
      getValue("competitor3", "competitor3", "") !== "Not provided" || 
      getValue("competitor4", "competitor4", "") !== "Not provided"
    );
  };

  // Helper to check if any reference is provided
  const hasReferences = () => {
    return Boolean(
      getValue("reference1", "reference1", "") !== "Not provided" || 
      getValue("reference2", "reference2", "") !== "Not provided" || 
      getValue("reference3", "reference3", "") !== "Not provided" || 
      getValue("reference4", "reference4", "") !== "Not provided"
    );
  };

  // Helper to safely get page details
  const getPageDetails = () => {
    const details = getValue("pageDetails", "page_details", []);
    return Array.isArray(details) ? details : 
           details && typeof details === 'object' ? [details] : [];
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">About Company</h4>
        <p className="mt-1">{getValue("aboutCompany", "about_company")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Target Audience</h4>
        <p className="mt-1">{getValue("targetAudience", "target_audience")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Project Type</h4>
          <p className="mt-1">{getValue("projectType", "project_type")}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Project Size</h4>
          <p className="mt-1">{getValue("projectSize", "project_size")}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Website Type Interest</h4>
        <p className="mt-1">{getWebsiteTypeInterest()}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Current Website</h4>
        <p className="mt-1">{getValue("currentWebsite", "current_website")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Website Purpose</h4>
        <p className="mt-1">{getValue("websitePurpose", "website_purpose")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Project Description</h4>
        <p className="mt-1">{getValue("projectDescription", "project_description")}</p>
      </div>
      
      {/* Competitors section */}
      <div>
        <h4 className="font-medium">Competitors</h4>
        <div className="space-y-2 mt-1">
          {getValue("competitor1", "competitor1", "") !== "Not provided" && 
            <p>1. {getValue("competitor1", "competitor1")}</p>}
          {getValue("competitor2", "competitor2", "") !== "Not provided" && 
            <p>2. {getValue("competitor2", "competitor2")}</p>}
          {getValue("competitor3", "competitor3", "") !== "Not provided" && 
            <p>3. {getValue("competitor3", "competitor3")}</p>}
          {getValue("competitor4", "competitor4", "") !== "Not provided" && 
            <p>4. {getValue("competitor4", "competitor4")}</p>}
          {!hasCompetitors() && <p>None provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Existing Brand Assets</h4>
        <p className="mt-1">{getValue("existingBrandAssets", "existing_brand_assets")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Brand Guidelines</h4>
        <p className="mt-1">{getValue("hasBrandGuidelines", "has_brand_guidelines")}</p>
        {(getValue("hasBrandGuidelines", "has_brand_guidelines") === "Yes" || 
          getValue("hasBrandGuidelines", "has_brand_guidelines") === true) && (
          <p className="mt-1">{getValue("brandGuidelinesDetails", "brand_guidelines_details")}</p>
        )}
      </div>
      
      <div>
        <h4 className="font-medium">Wireframe</h4>
        <p className="mt-1">{getValue("hasWireframe", "has_wireframe")}</p>
        {(getValue("hasWireframe", "has_wireframe") === "Yes" || 
          getValue("hasWireframe", "has_wireframe") === true) && (
          <p className="mt-1">{getValue("wireframeDetails", "wireframe_details")}</p>
        )}
      </div>
      
      <div>
        <h4 className="font-medium">General Style</h4>
        <p className="mt-1">{getValue("generalStyle", "general_style")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Color Preferences</h4>
        <p className="mt-1">{getValue("colorPreferences", "color_preferences")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Font Preferences</h4>
        <p className="mt-1">{getValue("fontPreferences", "font_preferences")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Design References</h4>
        <div className="space-y-2 mt-1">
          {getValue("reference1", "reference1", "") !== "Not provided" && 
            <p>1. {getValue("reference1", "reference1")}</p>}
          {getValue("reference2", "reference2", "") !== "Not provided" && 
            <p>2. {getValue("reference2", "reference2")}</p>}
          {getValue("reference3", "reference3", "") !== "Not provided" && 
            <p>3. {getValue("reference3", "reference3")}</p>}
          {getValue("reference4", "reference4", "") !== "Not provided" && 
            <p>4. {getValue("reference4", "reference4")}</p>}
          {!hasReferences() && <p>None provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Style Preferences</h4>
        <p className="mt-1">{getValue("stylePreferences", "style_preferences")}</p>
      </div>
      
      {/* Pages Information */}
      <div>
        <h4 className="font-medium">Number of Pages</h4>
        <p className="mt-1">{getValue("pageCount", "page_count")}</p>
      </div>
      
      {getPageDetails().length > 0 && (
        <div>
          <h4 className="font-medium">Page Details</h4>
          <div className="space-y-2 mt-1">
            {getPageDetails().map((detail: any, index: number) => {
              const detailName = detail?.name || "Unnamed Page";
              const detailDescription = detail?.description || "No description provided";
              
              return (
                <div key={index} className="border p-3 rounded-md">
                  <p className="font-medium">Page {index + 1}: {detailName}</p>
                  <p>{detailDescription}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div>
        <h4 className="font-medium">Website Content</h4>
        <p className="mt-1">{getValue("websiteContent", "website_content")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Development Service</h4>
        <p className="mt-1">{getValue("developmentService", "development_service")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Completion Deadline</h4>
        <p className="mt-1">{formatDate(getValue("completionDeadline", "completion_deadline"))}</p>
      </div>
    </div>
  );
};

export default UIDesignBriefDetails;
