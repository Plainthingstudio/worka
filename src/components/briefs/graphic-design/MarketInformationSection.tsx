
import React from "react";

interface MarketInformationSectionProps {
  productsServices: string | null;
  featuresAndBenefits: string | null;
  marketCategory: string | null;
  brandPositioning: string | null;
  barrierToEntry: string | null;
}

const MarketInformationSection: React.FC<MarketInformationSectionProps> = ({
  productsServices,
  featuresAndBenefits,
  marketCategory,
  brandPositioning,
  barrierToEntry
}) => {
  return (
    <>
      <div>
        <h4 className="font-medium">Products/Services</h4>
        <p className="mt-1">{productsServices || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Features & Benefits</h4>
        <p className="mt-1">{featuresAndBenefits || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Market Category</h4>
        <p className="mt-1">{marketCategory || "Not provided"}</p>
      </div>

      <div>
        <h4 className="font-medium">Brand Positioning</h4>
        <p className="mt-1">{brandPositioning || "Not provided"}</p>
      </div>

      <div>
        <h4 className="font-medium">Barrier to Entry</h4>
        <p className="mt-1">{barrierToEntry || "Not provided"}</p>
      </div>
    </>
  );
};

export default MarketInformationSection;
