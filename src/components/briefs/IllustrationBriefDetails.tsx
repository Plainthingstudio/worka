
import React from "react";
import { format } from "date-fns";

interface IllustrationBriefDetailsProps {
  briefDetails: any;
}

const IllustrationBriefDetails: React.FC<IllustrationBriefDetailsProps> = ({ briefDetails }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">About Company</h4>
        <p className="mt-1">{briefDetails.aboutCompany || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Illustrations Purpose</h4>
        <p className="mt-1">{briefDetails.illustrationsPurpose || "Not provided"}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Illustrations For</h4>
          <p className="mt-1">{briefDetails.illustrationsFor || "Not provided"}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Illustrations Style</h4>
          <p className="mt-1">{briefDetails.illustrationsStyle || "Not provided"}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Target Audience</h4>
        <p className="mt-1">{briefDetails.targetAudience || "Not provided"}</p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Illustrations Details</h4>
        <p><span className="font-medium">Count:</span> {briefDetails.illustrationsCount || "Not provided"}</p>
        
        {briefDetails.illustrationDetails && briefDetails.illustrationDetails.length > 0 && (
          <div className="space-y-2 mt-2">
            {briefDetails.illustrationDetails.map((detail: string, index: number) => 
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
      
      <div>
        <h4 className="font-medium">Deliverables</h4>
        <p className="mt-1">
          {briefDetails.deliverables && briefDetails.deliverables.length 
            ? briefDetails.deliverables.join(", ") 
            : "Not provided"}
        </p>
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

export default IllustrationBriefDetails;
