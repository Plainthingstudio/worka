
import React from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GraphicDesignBriefDetailsProps {
  briefDetails: any;
}

const GraphicDesignBriefDetails: React.FC<GraphicDesignBriefDetailsProps> = ({ briefDetails }) => {
  // Helper function to safely display values
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "Not provided";
    }
    return String(value);
  };

  // Helper to get values from either camelCase or snake_case keys
  const getValue = (camelCaseKey: string, snakeCaseKey: string, defaultValue = "Not provided") => {
    const value = briefDetails[camelCaseKey] !== undefined 
      ? briefDetails[camelCaseKey] 
      : briefDetails[snakeCaseKey] !== undefined 
        ? briefDetails[snakeCaseKey] 
        : defaultValue;
    return displayValue(value);
  };

  // Get logo feelings with safe access
  const logoFeelings = briefDetails.logoFeelings || briefDetails.logo_feelings || {};

  return (
    <div className="space-y-6">
      {/* Company Information Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">About Company</h3>
        <p>{getValue("aboutCompany", "about_company")}</p>
        
        <h3 className="text-lg font-medium">Vision and Mission</h3>
        <p>{getValue("visionMission", "vision_mission")}</p>
        
        <h3 className="text-lg font-medium">Slogan</h3>
        <p>{getValue("slogan", "slogan")}</p>
      </section>
      
      <Separator />
      
      {/* Logo Preferences Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Logo Preferences</h3>
        
        {logoFeelings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logoFeelings.gender && (
              <div>
                <p className="font-medium">Feminine vs Masculine</p>
                <p>{displayValue(logoFeelings.gender)}</p>
              </div>
            )}
            
            {logoFeelings.pricing && (
              <div>
                <p className="font-medium">Economical vs Luxury</p>
                <p>{displayValue(logoFeelings.pricing)}</p>
              </div>
            )}
            
            {logoFeelings.era && (
              <div>
                <p className="font-medium">Modern vs Classic</p>
                <p>{displayValue(logoFeelings.era)}</p>
              </div>
            )}
            
            {logoFeelings.tone && (
              <div>
                <p className="font-medium">Serious vs Playful</p>
                <p>{displayValue(logoFeelings.tone)}</p>
              </div>
            )}
            
            {logoFeelings.complexity && (
              <div>
                <p className="font-medium">Simple vs Complex</p>
                <p>{displayValue(logoFeelings.complexity)}</p>
              </div>
            )}
          </div>
        )}
        
        <div>
          <p className="font-medium">Logo Type</p>
          <p>{getValue("logoType", "logo_type")}</p>
        </div>
        
        <div>
          <p className="font-medium">Tone</p>
          <p>
            {typeof briefDetails.tone === 'object' && briefDetails.tone !== null
              ? Object.entries(briefDetails.tone)
                  .filter(([_, isSelected]) => isSelected === true)
                  .map(([key]) => key)
                  .join(', ') || 'Not provided'
              : getValue("tone", "tone")}
          </p>
        </div>
      </section>
      
      <Separator />
      
      {/* Target Audience Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Target Audience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Target Age</p>
            <p>{getValue("targetAge", "target_age")}</p>
          </div>
          
          <div>
            <p className="font-medium">Target Gender</p>
            <p>{getValue("targetGender", "target_gender")}</p>
          </div>
          
          <div>
            <p className="font-medium">Target Demography</p>
            <p>{getValue("targetDemography", "target_demography")}</p>
          </div>
          
          <div>
            <p className="font-medium">Target Profession</p>
            <p>{getValue("targetProfession", "target_profession")}</p>
          </div>
        </div>
        
        <div>
          <p className="font-medium">Target Personality</p>
          <p>{getValue("targetPersonality", "target_personality")}</p>
        </div>
      </section>
      
      <Separator />
      
      {/* Market Information Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Market Information</h3>
        
        <div>
          <p className="font-medium">Products/Services</p>
          <p>{getValue("productsServices", "products_services")}</p>
        </div>
        
        <div>
          <p className="font-medium">Features & Benefits</p>
          <p>{getValue("featuresAndBenefits", "features_and_benefits")}</p>
        </div>
        
        <div>
          <p className="font-medium">Market Category</p>
          <p>{getValue("marketCategory", "market_category")}</p>
        </div>
        
        <div>
          <p className="font-medium">Brand Positioning</p>
          <p>{getValue("brandPositioning", "brand_positioning")}</p>
        </div>
        
        <div>
          <p className="font-medium">Barrier to Entry</p>
          <p>{getValue("barrierToEntry", "barrier_to_entry")}</p>
        </div>
      </section>
      
      <Separator />
      
      {/* Competitors & References Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Competitors & References</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["competitor1", "competitor2", "competitor3", "competitor4"].map((key, index) => (
            briefDetails[key] && (
              <div key={key}>
                <p className="font-medium">Competitor {index + 1}</p>
                <p>{displayValue(briefDetails[key])}</p>
              </div>
            )
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {["reference1", "reference2", "reference3", "reference4"].map((key, index) => (
            briefDetails[key] && (
              <div key={key}>
                <p className="font-medium">Reference {index + 1}</p>
                <p>{displayValue(briefDetails[key])}</p>
              </div>
            )
          ))}
        </div>
        
        <div>
          <p className="font-medium">Specific Imagery</p>
          <p>{getValue("specificImagery", "specific_imagery")}</p>
        </div>
      </section>
      
      <Separator />
      
      {/* Services & Media Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Services & Media</h3>
        
        <div>
          <p className="font-medium">Services Required</p>
          <p>{getValue("services", "services")}</p>
        </div>
        
        <div>
          <p className="font-medium">Print Media</p>
          <p>{getValue("printMedia", "print_media")}</p>
        </div>
        
        <div>
          <p className="font-medium">Digital Media</p>
          <p>{getValue("digitalMedia", "digital_media")}</p>
        </div>
      </section>
    </div>
  );
};

export default GraphicDesignBriefDetails;
