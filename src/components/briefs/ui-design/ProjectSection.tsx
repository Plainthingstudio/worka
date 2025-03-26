
import React from "react";
import { getValue } from "./UIHelperFunctions";

interface ProjectSectionProps {
  briefDetails: any;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({ briefDetails }) => {
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
        <h4 className="font-medium">Website Type</h4>
        <p className="mt-1">{getValue(briefDetails, "websiteTypeInterest", "website_type_interest")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Current Website</h4>
        <p className="mt-1">{getValue(briefDetails, "currentWebsite", "current_website")}</p>
      </div>
      
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
