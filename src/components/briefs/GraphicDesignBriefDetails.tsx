
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

  // Get all data with fallback values
  const companyName = briefDetails?.companyName || briefDetails?.company_name || "";
  const aboutCompany = briefDetails?.aboutCompany || briefDetails?.about_company || "";
  const visionMission = briefDetails?.visionMission || briefDetails?.vision_mission || "";
  const slogan = briefDetails?.slogan || "";
  
  return (
    <div className="space-y-6">
      {/* Pass data as a single object to avoid TypeScript errors */}
      <CompanyInfoSection 
        data={{
          companyName,
          aboutCompany,
          visionMission,
          slogan
        }}
      />
      
      <MarketInformationSection 
        marketCategory={briefDetails?.marketCategory || briefDetails?.market_category || ""}
        productsServices={briefDetails?.productsServices || briefDetails?.products_services || ""}
        featuresAndBenefits={briefDetails?.featuresAndBenefits || briefDetails?.features_and_benefits || ""}
        brandPositioning={briefDetails?.brandPositioning || briefDetails?.brand_positioning || ""}
        barrierToEntry={briefDetails?.barrierToEntry || briefDetails?.barrier_to_entry || ""}
      />
      
      <TargetAudienceSection 
        targetAge={briefDetails?.targetAge || briefDetails?.target_age || ""}
        targetGender={briefDetails?.targetGender || briefDetails?.target_gender || ""}
        targetDemography={briefDetails?.targetDemography || briefDetails?.target_demography || ""}
        targetProfession={briefDetails?.targetProfession || briefDetails?.target_profession || ""}
        targetPersonality={briefDetails?.targetPersonality || briefDetails?.target_personality || ""}
      />
      
      <LogoPreferencesSection 
        logoFeelings={logoFeelings} 
        logoType={logoType} 
      />
      
      <CompetitorsReferencesSection 
        competitor1={briefDetails?.competitor1 || ""}
        competitor2={briefDetails?.competitor2 || ""}
        competitor3={briefDetails?.competitor3 || ""}
        competitor4={briefDetails?.competitor4 || ""}
        reference1={briefDetails?.reference1 || ""}
        reference2={briefDetails?.reference2 || ""}
        reference3={briefDetails?.reference3 || ""}
        reference4={briefDetails?.reference4 || ""}
        specificImagery={briefDetails?.specificImagery || briefDetails?.specific_imagery || ""}
      />
      
      <ServicesMediaSection 
        services={briefDetails?.services || []}
        printMedia={briefDetails?.printMedia || briefDetails?.print_media || []}
        digitalMedia={briefDetails?.digitalMedia || briefDetails?.digital_media || []}
      />
    </div>
  );
};

export default GraphicDesignBriefDetails;
