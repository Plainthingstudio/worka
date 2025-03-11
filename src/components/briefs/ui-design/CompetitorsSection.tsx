
import React from "react";
import { getValue, hasCompetitors } from "./UIHelperFunctions";

interface CompetitorsSectionProps {
  briefDetails: any;
}

const CompetitorsSection: React.FC<CompetitorsSectionProps> = ({ briefDetails }) => {
  return (
    <div>
      <h4 className="font-medium">Competitors</h4>
      <div className="space-y-2 mt-1">
        {getValue(briefDetails, "competitor1", "competitor1", "") !== "Not provided" && 
          <p>1. {getValue(briefDetails, "competitor1", "competitor1")}</p>}
        {getValue(briefDetails, "competitor2", "competitor2", "") !== "Not provided" && 
          <p>2. {getValue(briefDetails, "competitor2", "competitor2")}</p>}
        {getValue(briefDetails, "competitor3", "competitor3", "") !== "Not provided" && 
          <p>3. {getValue(briefDetails, "competitor3", "competitor3")}</p>}
        {getValue(briefDetails, "competitor4", "competitor4", "") !== "Not provided" && 
          <p>4. {getValue(briefDetails, "competitor4", "competitor4")}</p>}
        {!hasCompetitors(briefDetails) && <p>None provided</p>}
      </div>
    </div>
  );
};

export default CompetitorsSection;
