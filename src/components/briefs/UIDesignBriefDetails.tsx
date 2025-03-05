
import React from "react";
import { format } from "date-fns";

interface PageDetail {
  name: string;
  description: string;
}

interface UIDesignBriefDetailsProps {
  briefDetails: any;
}

const UIDesignBriefDetails: React.FC<UIDesignBriefDetailsProps> = ({ briefDetails }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">About Company</h4>
        <p className="mt-1">{briefDetails.aboutCompany || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Target Audience</h4>
        <p className="mt-1">{briefDetails.targetAudience || "Not provided"}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Project Type</h4>
          <p className="mt-1">{briefDetails.projectType || "Not provided"}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Project Size</h4>
          <p className="mt-1">{briefDetails.projectSize || "Not provided"}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Website Type Interest</h4>
        <p className="mt-1">
          {briefDetails.websiteTypeInterest && briefDetails.websiteTypeInterest.length 
            ? briefDetails.websiteTypeInterest.join(", ") 
            : "Not provided"}
        </p>
      </div>
      
      <div>
        <h4 className="font-medium">Current Website</h4>
        <p className="mt-1">{briefDetails.currentWebsite || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Website Purpose</h4>
        <p className="mt-1">{briefDetails.websitePurpose || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Project Description</h4>
        <p className="mt-1">{briefDetails.projectDescription || "Not provided"}</p>
      </div>
      
      {/* Competitors section */}
      <div>
        <h4 className="font-medium">Competitors</h4>
        <div className="space-y-2 mt-1">
          {briefDetails.competitor1 && <p>1. {briefDetails.competitor1}</p>}
          {briefDetails.competitor2 && <p>2. {briefDetails.competitor2}</p>}
          {briefDetails.competitor3 && <p>3. {briefDetails.competitor3}</p>}
          {briefDetails.competitor4 && <p>4. {briefDetails.competitor4}</p>}
          {!briefDetails.competitor1 && !briefDetails.competitor2 && 
            !briefDetails.competitor3 && !briefDetails.competitor4 && <p>Not provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Existing Brand Assets</h4>
        <p className="mt-1">{briefDetails.existingBrandAssets || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Brand Guidelines</h4>
        <p className="mt-1">{briefDetails.hasBrandGuidelines || "Not provided"}</p>
        {briefDetails.hasBrandGuidelines === "Yes" && briefDetails.brandGuidelinesDetails && (
          <p className="mt-1">{briefDetails.brandGuidelinesDetails}</p>
        )}
      </div>
      
      <div>
        <h4 className="font-medium">Wireframe</h4>
        <p className="mt-1">{briefDetails.hasWireframe || "Not provided"}</p>
        {briefDetails.hasWireframe === "Yes" && briefDetails.wireframeDetails && (
          <p className="mt-1">{briefDetails.wireframeDetails}</p>
        )}
      </div>
      
      <div>
        <h4 className="font-medium">General Style</h4>
        <p className="mt-1">{briefDetails.generalStyle || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Color Preferences</h4>
        <p className="mt-1">{briefDetails.colorPreferences || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Font Preferences</h4>
        <p className="mt-1">{briefDetails.fontPreferences || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Design References</h4>
        <div className="space-y-2 mt-1">
          {briefDetails.reference1 && <p>1. {briefDetails.reference1}</p>}
          {briefDetails.reference2 && <p>2. {briefDetails.reference2}</p>}
          {briefDetails.reference3 && <p>3. {briefDetails.reference3}</p>}
          {briefDetails.reference4 && <p>4. {briefDetails.reference4}</p>}
          {!briefDetails.reference1 && !briefDetails.reference2 && 
            !briefDetails.reference3 && !briefDetails.reference4 && <p>Not provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Style Preferences</h4>
        <p className="mt-1">{briefDetails.stylePreferences || "Not provided"}</p>
      </div>
      
      {/* Pages Information */}
      <div>
        <h4 className="font-medium">Number of Pages</h4>
        <p className="mt-1">{briefDetails.pageCount || "Not provided"}</p>
      </div>
      
      {briefDetails.pageDetails && briefDetails.pageDetails.length > 0 && (
        <div>
          <h4 className="font-medium">Page Details</h4>
          <div className="space-y-2 mt-1">
            {briefDetails.pageDetails.map((detail: PageDetail, index: number) => (
              <div key={index} className="border p-3 rounded-md">
                <p className="font-medium">Page {index + 1}: {detail.name}</p>
                <p>{detail.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h4 className="font-medium">Website Content</h4>
        <p className="mt-1">{briefDetails.websiteContent || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Development Service</h4>
        <p className="mt-1">{briefDetails.developmentService || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Completion Deadline</h4>
        <p className="mt-1">
          {briefDetails.completionDeadline 
            ? format(new Date(briefDetails.completionDeadline), "MMMM d, yyyy") 
            : "Not provided"}
        </p>
      </div>
    </div>
  );
};

export default UIDesignBriefDetails;
