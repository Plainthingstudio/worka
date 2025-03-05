
import React from "react";

interface CompetitorsReferencesSectionProps {
  competitor1?: string | null;
  competitor2?: string | null;
  competitor3?: string | null;
  competitor4?: string | null;
  reference1?: string | null;
  reference2?: string | null;
  reference3?: string | null;
  reference4?: string | null;
  specificImagery?: string | null;
}

const CompetitorsReferencesSection: React.FC<CompetitorsReferencesSectionProps> = ({
  competitor1,
  competitor2,
  competitor3,
  competitor4,
  reference1,
  reference2,
  reference3,
  reference4,
  specificImagery
}) => {
  return (
    <>
      {/* Competitors section */}
      <div>
        <h4 className="font-medium">Competitors</h4>
        <div className="space-y-2 mt-1">
          {competitor1 && <p>1. {competitor1}</p>}
          {competitor2 && <p>2. {competitor2}</p>}
          {competitor3 && <p>3. {competitor3}</p>}
          {competitor4 && <p>4. {competitor4}</p>}
          {!competitor1 && !competitor2 && 
            !competitor3 && !competitor4 && <p>Not provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Specific Imagery</h4>
        <p className="mt-1">{specificImagery || "Not provided"}</p>
      </div>
      
      {/* References section */}
      <div>
        <h4 className="font-medium">Design References</h4>
        <div className="space-y-2 mt-1">
          {reference1 && <p>1. {reference1}</p>}
          {reference2 && <p>2. {reference2}</p>}
          {reference3 && <p>3. {reference3}</p>}
          {reference4 && <p>4. {reference4}</p>}
          {!reference1 && !reference2 && 
            !reference3 && !reference4 && <p>Not provided</p>}
        </div>
      </div>
    </>
  );
};

export default CompetitorsReferencesSection;
