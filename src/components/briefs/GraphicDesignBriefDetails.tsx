
import React, { useEffect } from "react";
import CompanyInfoSection from "./graphic-design/CompanyInfoSection";
import MarketInformationSection from "./graphic-design/MarketInformationSection";
import TargetAudienceSection from "./graphic-design/TargetAudienceSection";
import LogoPreferencesSection from "./graphic-design/LogoPreferencesSection";
import CompetitorsReferencesSection from "./graphic-design/CompetitorsReferencesSection";
import ServicesMediaSection from "./graphic-design/ServicesMediaSection";

interface GraphicDesignBriefDetailsProps {
  briefDetails: any;
}

const GraphicDesignBriefDetails: React.FC<GraphicDesignBriefDetailsProps> = ({ briefDetails }) => {
  // Add useEffect to log and debug the incoming data
  useEffect(() => {
    console.log("GraphicDesignBriefDetails component rendered with:", briefDetails);
    
    // Also specifically log the logo feelings data to help debug
    let logoFeelings = briefDetails?.logoFeelings || briefDetails?.logo_feelings;
    
    console.log("Logo feelings prepared in GraphicDesignBriefDetails:", logoFeelings);
  }, [briefDetails]);
  
  // Prepare logo feelings safely
  const prepareLogoFeelings = () => {
    let logoFeelings = briefDetails?.logoFeelings || briefDetails?.logo_feelings;
    
    // If logo feelings is a string, try to parse it
    if (typeof logoFeelings === 'string') {
      try {
        logoFeelings = JSON.parse(logoFeelings);
        console.log("Successfully parsed logoFeelings in GraphicDesignBriefDetails:", logoFeelings);
      } catch (e) {
        console.error("Failed to parse logoFeelings in GraphicDesignBriefDetails:", e);
        // Use an empty object to prevent null access errors
        logoFeelings = {};
      }
    }
    
    // If it's still not an object (null, undefined, etc), use an empty object
    if (!logoFeelings || typeof logoFeelings !== 'object') {
      logoFeelings = {};
    }
    
    return logoFeelings;
  };
  
  const logoFeelings = prepareLogoFeelings();
  const logoType = briefDetails?.logoType || briefDetails?.logo_type || null;

  return (
    <div className="space-y-6">
      <CompanyInfoSection briefDetails={briefDetails} />
      <MarketInformationSection briefDetails={briefDetails} />
      <TargetAudienceSection briefDetails={briefDetails} />
      <LogoPreferencesSection 
        logoFeelings={logoFeelings} 
        logoType={logoType} 
      />
      <CompetitorsReferencesSection briefDetails={briefDetails} />
      <ServicesMediaSection briefDetails={briefDetails} />
    </div>
  );
};

export default GraphicDesignBriefDetails;
