
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
  const getValue = (camelCaseKey: string, snakeCaseKey: string) => {
    return briefDetails[camelCaseKey] || briefDetails[snakeCaseKey] || "Not provided";
  };

  // Helper to get illustrations count safely
  const getIllustrationsCount = () => {
    const count = briefDetails.illustrationsCount || briefDetails.illustrations_count;
    return count ? count.toString() : "Not provided";
  };

  // Helper to get illustration details safely
  const getIllustrationDetails = () => {
    const details = briefDetails.illustrationDetails || briefDetails.illustration_details;
    return Array.isArray(details) ? details : [];
  };

  // Helper to get deliverables safely
  const getDeliverables = () => {
    const deliverables = briefDetails.deliverables;
    if (Array.isArray(deliverables) && deliverables.length > 0) {
      return deliverables.join(", ");
    }
    return "Not provided";
  };

  // Helper to check if any competitor is provided
  const hasCompetitors = () => {
    return Boolean(
      briefDetails.competitor1 || 
      briefDetails.competitor2 || 
      briefDetails.competitor3 || 
      briefDetails.competitor4
    );
  };

  // Helper to check if any reference is provided
  const hasReferences = () => {
    return Boolean(
      briefDetails.reference1 || 
      briefDetails.reference2 || 
      briefDetails.reference3 || 
      briefDetails.reference4
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
          {briefDetails.competitor1 && <p>1. {briefDetails.competitor1}</p>}
          {briefDetails.competitor2 && <p>2. {briefDetails.competitor2}</p>}
          {briefDetails.competitor3 && <p>3. {briefDetails.competitor3}</p>}
          {briefDetails.competitor4 && <p>4. {briefDetails.competitor4}</p>}
          {!hasCompetitors() && <p>Not provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Brand Guidelines</h4>
        <p className="mt-1">{getValue("brandGuidelines", "brand_guidelines")}</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Illustrations Details</h4>
        <p><span className="font-medium">Count:</span> {getIllustrationsCount()}</p>
        
        {getIllustrationDetails().length > 0 && (
          <div className="space-y-2 mt-2">
            {getIllustrationDetails().map((detail: string, index: number) => 
              detail && (
                <div key={index} className="border p-3 rounded-md">
                  <p className="font-medium">Illustration {index + 1}</p>
                  <p>{detail}</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
      
      {/* Reference section */}
      <div>
        <h4 className="font-medium">Design References</h4>
        <div className="space-y-2 mt-1">
          {briefDetails.reference1 && <p>1. {briefDetails.reference1}</p>}
          {briefDetails.reference2 && <p>2. {briefDetails.reference2}</p>}
          {briefDetails.reference3 && <p>3. {briefDetails.reference3}</p>}
          {briefDetails.reference4 && <p>4. {briefDetails.reference4}</p>}
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
        <p className="mt-1">{formatDate(briefDetails.completionDeadline || briefDetails.completion_deadline)}</p>
      </div>
    </div>
  );
};

export default IllustrationBriefDetails;
