
import React from "react";

interface CompanyInfoSectionProps {
  aboutCompany: string | null;
  visionMission: string | null;
  slogan: string | null;
}

const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({
  aboutCompany,
  visionMission,
  slogan
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">About Company</h4>
        <p className="mt-1">{aboutCompany || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Vision and Mission</h4>
        <p className="mt-1">{visionMission || "Not provided"}</p>
      </div>

      <div>
        <h4 className="font-medium">Slogan</h4>
        <p className="mt-1">{slogan || "Not provided"}</p>
      </div>
    </div>
  );
};

export default CompanyInfoSection;
