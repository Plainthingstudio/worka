
import React from "react";
import { format, isValid, parseISO } from "date-fns";

interface IllustrationBriefDetailsProps {
  briefDetails: any;
}

const IllustrationBriefDetails: React.FC<IllustrationBriefDetailsProps> = ({ briefDetails }) => {
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

  // Helper function to get value that might be in camelCase or snake_case
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

  // Helper to handle illustration details which could be an array or object
  const getIllustrationDetails = () => {
    const details = getValue("illustrationDetails", "illustration_details", []);
    return Array.isArray(details) ? details : 
           details && typeof details === 'object' ? [details] : [];
  };

  // Helper to process the details to a string
  const processDetailsToString = (details: any[]): string => {
    if (!details || details.length === 0) return "Not provided";
    
    try {
      return details.map(detail => {
        if (typeof detail === 'string') return detail;
        return JSON.stringify(detail);
      }).join(", ");
    } catch (error) {
      console.error("Error processing details:", error);
      return "Error processing details";
    }
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

  // Helper to format deliverables which might be an array or string
  const formatDeliverables = (deliverables: any): string => {
    if (!deliverables) return "Not provided";
    
    if (Array.isArray(deliverables)) {
      return deliverables.join(", ");
    }
    
    if (typeof deliverables === 'string') {
      return deliverables;
    }
    
    return "Not provided";
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">About Company</h4>
        <p className="mt-1">{getValue("aboutCompany", "about_company")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Illustrations Purpose</h4>
        <p className="mt-1">{getValue("illustrationsPurpose", "illustrations_purpose")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Illustrations For</h4>
        <p className="mt-1">{getValue("illustrationsFor", "illustrations_for")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Illustrations Style</h4>
        <p className="mt-1">{getValue("illustrationsStyle", "illustrations_style")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Target Audience</h4>
        <p className="mt-1">{getValue("targetAudience", "target_audience")}</p>
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
        <h4 className="font-medium">Brand Guidelines</h4>
        <p className="mt-1">{getValue("brandGuidelines", "brand_guidelines")}</p>
      </div>
      
      {/* Design References */}
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
        <h4 className="font-medium">General Style</h4>
        <p className="mt-1">{getValue("generalStyle", "general_style")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Color Preferences</h4>
        <p className="mt-1">{getValue("colorPreferences", "color_preferences")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Likes/Dislikes in Design</h4>
        <p className="mt-1">{getValue("likeDislikeDesign", "like_dislike_design")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Number of Illustrations</h4>
        <p className="mt-1">{getValue("illustrationsCount", "illustrations_count")}</p>
      </div>
      
      {/* Illustration Details */}
      <div>
        <h4 className="font-medium">Illustration Details</h4>
        <div className="space-y-2 mt-1">
          {getIllustrationDetails().map((detail, index) => (
            <div key={index} className="border p-3 rounded-md">
              <p className="font-medium">Illustration {index + 1}</p>
              <p>{typeof detail === 'string' ? detail : JSON.stringify(detail)}</p>
            </div>
          ))}
          {getIllustrationDetails().length === 0 && <p>No details provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">File Formats</h4>
        <p className="mt-1">{formatDeliverables(getValue("deliverables", "deliverables"))}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Completion Deadline</h4>
        <p className="mt-1">{formatDate(getValue("completionDeadline", "completion_deadline"))}</p>
      </div>
    </div>
  );
};

export default IllustrationBriefDetails;
