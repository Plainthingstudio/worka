
import React from "react";
import { format } from "date-fns";

interface GraphicDesignBriefDetailsProps {
  briefDetails: any;
}

const GraphicDesignBriefDetails: React.FC<GraphicDesignBriefDetailsProps> = ({ briefDetails }) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium">About Company</h4>
        <p className="mt-1">{briefDetails.aboutCompany || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Vision and Mission</h4>
        <p className="mt-1">{briefDetails.visionMission || "Not provided"}</p>
      </div>

      <div>
        <h4 className="font-medium">Slogan</h4>
        <p className="mt-1">{briefDetails.slogan || "Not provided"}</p>
      </div>
      
      {briefDetails.logoFeelings && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium">Logo Style</h4>
            <p className="mt-1">{briefDetails.logoFeelings.style || "Not provided"}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Logo Pricing</h4>
            <p className="mt-1">{briefDetails.logoFeelings.pricing || "Not provided"}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Logo Era</h4>
            <p className="mt-1">{briefDetails.logoFeelings.era || "Not provided"}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Logo Tone</h4>
            <p className="mt-1">{briefDetails.logoFeelings.tone || "Not provided"}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Logo Complexity</h4>
            <p className="mt-1">{briefDetails.logoFeelings.complexity || "Not provided"}</p>
          </div>
          
          <div>
            <h4 className="font-medium">Logo Gender</h4>
            <p className="mt-1">{briefDetails.logoFeelings.gender || "Not provided"}</p>
          </div>
        </div>
      )}
      
      <div>
        <h4 className="font-medium">Logo Type</h4>
        <p className="mt-1">{briefDetails.logoType || "Not provided"}</p>
      </div>

      {/* Target audience section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium">Target Age</h4>
          <p className="mt-1">{briefDetails.targetAge || "Not provided"}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Target Gender</h4>
          <p className="mt-1">{briefDetails.targetGender || "Not provided"}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Target Demography</h4>
          <p className="mt-1">{briefDetails.targetDemography || "Not provided"}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Target Profession</h4>
          <p className="mt-1">{briefDetails.targetProfession || "Not provided"}</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium">Target Personality</h4>
        <p className="mt-1">{briefDetails.targetPersonality || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Products/Services</h4>
        <p className="mt-1">{briefDetails.productsServices || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Features & Benefits</h4>
        <p className="mt-1">{briefDetails.featuresAndBenefits || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Market Category</h4>
        <p className="mt-1">{briefDetails.marketCategory || "Not provided"}</p>
      </div>

      {/* Competitors section */}
      <div>
        <h4 className="font-medium">Competitors</h4>
        <div className="space-y-2 mt-1">
          {briefDetails.competitor1 && <p>1. {briefDetails.competitor1}</p>}
          {briefDetails.competitor2 && <p>2. {briefDetails.competitor2}</p>}
          {briefDetails.competitor3 && <p>3. {briefDetails.competitor3}</p>}
          {briefDetails.competitor4 && <p>4. {briefDetails.competitor4}</p>}
          {!briefDetails.competitor1 && !briefDetails.competitor2 && 
            !briefDetails.competitor3 && !briefDetails.competitor4 && <p>Not provided</p>}
        </div>
      </div>
      
      <div>
        <h4 className="font-medium">Brand Positioning</h4>
        <p className="mt-1">{briefDetails.brandPositioning || "Not provided"}</p>
      </div>

      <div>
        <h4 className="font-medium">Barrier to Entry</h4>
        <p className="mt-1">{briefDetails.barrierToEntry || "Not provided"}</p>
      </div>
      
      <div>
        <h4 className="font-medium">Specific Imagery</h4>
        <p className="mt-1">{briefDetails.specificImagery || "Not provided"}</p>
      </div>
          
      {/* Services section */}
      {briefDetails.services && briefDetails.services.length > 0 && (
        <div>
          <h4 className="font-medium">Services</h4>
          <p className="mt-1">{briefDetails.services.join(", ")}</p>
        </div>
      )}
      
      {/* Print Media section */}
      {briefDetails.printMedia && briefDetails.printMedia.length > 0 && (
        <div>
          <h4 className="font-medium">Print Media</h4>
          <p className="mt-1">{briefDetails.printMedia.join(", ")}</p>
        </div>
      )}
      
      {/* Digital Media section */}
      {briefDetails.digitalMedia && briefDetails.digitalMedia.length > 0 && (
        <div>
          <h4 className="font-medium">Digital Media</h4>
          <p className="mt-1">{briefDetails.digitalMedia.join(", ")}</p>
        </div>
      )}
    </div>
  );
};

export default GraphicDesignBriefDetails;
