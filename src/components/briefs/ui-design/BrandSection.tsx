
import React from "react";
import { getValue } from "./UIHelperFunctions";

interface BrandSectionProps {
  briefDetails: any;
}

const BrandSection: React.FC<BrandSectionProps> = ({ briefDetails }) => {
  return (
    <>
      <div>
        <h4 className="font-medium">Existing Brand Assets</h4>
        <p className="mt-1">{getValue(briefDetails, "existingBrandAssets", "existing_brand_assets")}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Brand Guidelines</h4>
        <p className="mt-1">{getValue(briefDetails, "hasBrandGuidelines", "has_brand_guidelines")}</p>
        {(getValue(briefDetails, "hasBrandGuidelines", "has_brand_guidelines") === "Yes" || 
          getValue(briefDetails, "hasBrandGuidelines", "has_brand_guidelines") === true) && (
          <p className="mt-1">{getValue(briefDetails, "brandGuidelinesDetails", "brand_guidelines_details")}</p>
        )}
      </div>
      
      <div>
        <h4 className="font-medium">Wireframe</h4>
        <p className="mt-1">{getValue(briefDetails, "hasWireframe", "has_wireframe")}</p>
        {(getValue(briefDetails, "hasWireframe", "has_wireframe") === "Yes" || 
          getValue(briefDetails, "hasWireframe", "has_wireframe") === true) && (
          <p className="mt-1">{getValue(briefDetails, "wireframeDetails", "wireframe_details")}</p>
        )}
      </div>
    </>
  );
};

export default BrandSection;
