
import React from "react";
import { format, isValid, parseISO } from "date-fns";

interface IllustrationBriefDetailsProps {
  briefDetails: any;
}

const IllustrationBriefDetails: React.FC<IllustrationBriefDetailsProps> = ({ briefDetails }) => {
  console.log("Illustration brief details:", briefDetails);

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

  // Helper to get illustrations count safely
  const getIllustrationsCount = () => {
    const count = getValue("illustrationsCount", "illustrations_count");
    return count !== "Not provided" ? count.toString() : "Not provided";
  };

  // Helper to get illustration details safely
  const getIllustrationDetails = () => {
    const details = getValue("illustrationDetails", "illustration_details", []);
    // Ensure details is an array, even if empty
    return Array.isArray(details) ? details : 
           details && typeof details === 'object' ? [details] : [];
  };

  // Helper to get deliverables safely
  const getDeliverables = () => {
    // Try different possible formats for deliverables
    const deliverables = briefDetails.deliverables;
    
    if (Array.isArray(deliverables) && deliverables.length > 0) {
      return deliverables.join(", ");
    } else if (deliverables && typeof deliverables === 'object') {
      // If it's an object, try to extract values
      return Object.values(deliverables).filter(Boolean).join(", ");
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Illustrations For</h4>
          <p className="mt-1">{getValue("illustrationsFor", "illustrations_for")}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Illustrations Style</h4>
          <p className="mt-1">{getValue("illustrationsStyle", "illustrations_style")}</p>
        </div>
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
      
      <div className="space-y-2">
        <h4 className="font-medium">Illustrations Details</h4>
        <p><span className="font-medium">Count:</span> {getIllustrationsCount()}</p>
        
        {getIllustrationDetails().length > 0 ? (
          <div className="space-y-2 mt-2">
            {getIllustrationDetails().map((detail: any, index: number) => {
              // Convert detail to string safely, no matter what type it is
              const detailText = typeof detail === 'string' ? detail : 
                               detail && typeof detail === 'object' ? JSON.stringify(detail) : 
                               detail ? String(detail) : "Not provided";
              
              return detail ? (
                <div key={index} className="border p-3 rounded-md">
                  <p className="font-medium">Illustration {index + 1}</p>
                  <p>{detailText}</p>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <p>No illustration details provided</p>
        )}
      </div>
      
      {/* Reference section */}
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
          {!hasReferences() && <p>Not provided</p>}
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
        <h4 className="font-medium">Deliverables</h4>
        <p className="mt-1">{getDeliverables()}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Completion Deadline</h4>
        <p className="mt-1">{formatDate(getValue("completionDeadline", "completion_deadline"))}</p>
      </div>
    </div>
  );
};

export default IllustrationBriefDetails;
