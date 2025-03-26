
import React from "react";
import { getValue } from "./UIHelperFunctions";

interface ProjectSectionProps {
  briefDetails: any;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ briefDetails }) => {
  // Helper function to get website type interests
  const getWebsiteTypeInterests = () => {
    let interests = briefDetails?.websiteTypeInterest || briefDetails?.website_type_interest || [];
    
    // If it's a string (JSON), try to parse it
    if (typeof interests === 'string') {
      try {
        interests = JSON.parse(interests);
      } catch (e) {
        console.error("Failed to parse website type interests:", e);
        return [];
      }
    }
    
    // If it's still not an array, but it's an object with selection properties
    if (!Array.isArray(interests) && typeof interests === 'object') {
      // This could be the checkbox object from the form
      // The selected items would have true values
      interests = Object.entries(interests)
        .filter(([_, selected]) => selected === true)
        .map(([key]) => key.replace(/_/g, ' '));
    }
    
    // Ensure we have an array
    return Array.isArray(interests) ? interests : [];
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Project Type</h4>
          <p className="mt-1">{getValue(briefDetails, "projectType", "project_type")}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Project Size</h4>
          <p className="mt-1">{getValue(briefDetails, "projectSize", "project_size")}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Current Website</h4>
        <p className="mt-1">{getValue(briefDetails, "currentWebsite", "current_website")}</p>
      </div>

      {/* Show website type interests if they exist */}
      {getWebsiteTypeInterests().length > 0 && (
        <div>
          <h4 className="font-medium">Website/App Type Interest</h4>
          <p className="mt-1">{getWebsiteTypeInterests().join(", ")}</p>
        </div>
      )}
      
      <div>
        <h4 className="font-medium">Website Purpose</h4>
        <p className="mt-1">{getValue(briefDetails, "websitePurpose", "website_purpose")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Project Description</h4>
        <p className="mt-1">{getValue(briefDetails, "projectDescription", "project_description")}</p>
      </div>
    </>
  );
};

export default ProjectSection;
