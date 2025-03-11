
import React from "react";
import { getValue, formatDate } from "./UIHelperFunctions";

interface ProjectDeliverySectionProps {
  briefDetails: any;
}

const ProjectDeliverySection: React.FC<ProjectDeliverySectionProps> = ({ briefDetails }) => {
  return (
    <>
      <div>
        <h4 className="font-medium">Website Content</h4>
        <p className="mt-1">{getValue(briefDetails, "websiteContent", "website_content")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Development Service</h4>
        <p className="mt-1">{getValue(briefDetails, "developmentService", "development_service")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Completion Deadline</h4>
        <p className="mt-1">{formatDate(getValue(briefDetails, "completionDeadline", "completion_deadline"))}</p>
      </div>
    </>
  );
};

export default ProjectDeliverySection;
