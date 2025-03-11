
import React from "react";
import { getValue } from "./UIHelperFunctions";

interface CompanySectionProps {
  briefDetails: any;
}

const CompanySection: React.FC<CompanySectionProps> = ({ briefDetails }) => {
  return (
    <>
      <div>
        <h4 className="font-medium">About Company</h4>
        <p className="mt-1">{getValue(briefDetails, "aboutCompany", "about_company")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Target Audience</h4>
        <p className="mt-1">{getValue(briefDetails, "targetAudience", "target_audience")}</p>
      </div>
    </>
  );
};

export default CompanySection;
