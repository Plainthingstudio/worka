
import React from "react";

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
      
      {/* Logo Preferences section */}
      <div>
        <h4 className="font-medium">Logo Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {briefDetails.logoFeelings && (
            <>
              <div>
                <h5 className="text-sm font-medium">Gender</h5>
                <p>{briefDetails.logoFeelings.gender || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Price Point</h5>
                <p>{briefDetails.logoFeelings.pricing || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Era</h5>
                <p>{briefDetails.logoFeelings.era || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Tone</h5>
                <p>{briefDetails.logoFeelings.tone || "Not provided"}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium">Complexity</h5>
                <p>{briefDetails.logoFeelings.complexity || "Not provided"}</p>
              </div>
            </>
          )}
          
          <div>
            <h5 className="text-sm font-medium">Logo Type</h5>
            <p>{briefDetails.logoType || "Not provided"}</p>
          </div>
        </div>
      </div>
      
      {/* Logo Tone section */}
      {briefDetails.tone && briefDetails.tone.length > 0 && (
        <div>
          <h4 className="font-medium">Logo Tone</h4>
          <p className="mt-1">{briefDetails.tone.join(", ")}</p>
        </div>
      )}

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
      
      {/* References section */}
      <div>
        <h4 className="font-medium">Design References</h4>
        <div className="space-y-2 mt-1">
          {briefDetails.reference1 && <p>1. {briefDetails.reference1}</p>}
          {briefDetails.reference2 && <p>2. {briefDetails.reference2}</p>}
          {briefDetails.reference3 && <p>3. {briefDetails.reference3}</p>}
          {briefDetails.reference4 && <p>4. {briefDetails.reference4}</p>}
          {!briefDetails.reference1 && !briefDetails.reference2 && 
            !briefDetails.reference3 && !briefDetails.reference4 && <p>Not provided</p>}
        </div>
      </div>
          
      {/* Services section */}
      {briefDetails.services && briefDetails.services.length > 0 && (
        <div>
          <h4 className="font-medium">Services Required</h4>
          <div className="space-y-1 mt-1">
            {briefDetails.services.map((service: string, index: number) => (
              <p key={index}>• {service}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Print Media section */}
      {briefDetails.printMedia && briefDetails.printMedia.length > 0 && (
        <div>
          <h4 className="font-medium">Print Media</h4>
          <div className="space-y-1 mt-1">
            {briefDetails.printMedia.map((item: string, index: number) => (
              <p key={index}>• {item}</p>
            ))}
          </div>
        </div>
      )}
      
      {/* Digital Media section */}
      {briefDetails.digitalMedia && briefDetails.digitalMedia.length > 0 && (
        <div>
          <h4 className="font-medium">Digital Media</h4>
          <div className="space-y-1 mt-1">
            {briefDetails.digitalMedia.map((item: string, index: number) => (
              <p key={index}>• {item}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphicDesignBriefDetails;
