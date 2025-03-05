
import React from "react";
import CompanyInfoSection from "./graphic-design/CompanyInfoSection";
import LogoPreferencesSection from "./graphic-design/LogoPreferencesSection";
import TargetAudienceSection from "./graphic-design/TargetAudienceSection";
import MarketInformationSection from "./graphic-design/MarketInformationSection";
import CompetitorsReferencesSection from "./graphic-design/CompetitorsReferencesSection";
import ServicesMediaSection from "./graphic-design/ServicesMediaSection";

interface GraphicDesignBriefDetailsProps {
  briefDetails: any;
}

const GraphicDesignBriefDetails: React.FC<GraphicDesignBriefDetailsProps> = ({ briefDetails }) => {
  // Debug the received data
  console.log("GraphicDesignBriefDetails received:", briefDetails);
  console.log("Services:", briefDetails.services);
  console.log("Print Media:", briefDetails.printMedia);
  console.log("Digital Media:", briefDetails.digitalMedia);
  
  return (
    <div className="space-y-4">
      <CompanyInfoSection 
        aboutCompany={briefDetails.aboutCompany}
        visionMission={briefDetails.visionMission}
        slogan={briefDetails.slogan}
      />
      
      <LogoPreferencesSection 
        logoFeelings={briefDetails.logoFeelings}
        logoType={briefDetails.logoType}
        tone={briefDetails.tone}
      />
      
      <TargetAudienceSection 
        targetAge={briefDetails.targetAge}
        targetGender={briefDetails.targetGender}
        targetDemography={briefDetails.targetDemography}
        targetProfession={briefDetails.targetProfession}
        targetPersonality={briefDetails.targetPersonality}
      />
      
      <MarketInformationSection 
        productsServices={briefDetails.productsServices}
        featuresAndBenefits={briefDetails.featuresAndBenefits}
        marketCategory={briefDetails.marketCategory}
        brandPositioning={briefDetails.brandPositioning}
        barrierToEntry={briefDetails.barrierToEntry}
      />
      
      <CompetitorsReferencesSection 
        competitor1={briefDetails.competitor1}
        competitor2={briefDetails.competitor2}
        competitor3={briefDetails.competitor3}
        competitor4={briefDetails.competitor4}
        reference1={briefDetails.reference1}
        reference2={briefDetails.reference2}
        reference3={briefDetails.reference3}
        reference4={briefDetails.reference4}
        specificImagery={briefDetails.specificImagery}
      />
      
      <ServicesMediaSection 
        services={briefDetails.services}
        printMedia={briefDetails.printMedia}
        digitalMedia={briefDetails.digitalMedia}
      />
    </div>
  );
};

export default GraphicDesignBriefDetails;
