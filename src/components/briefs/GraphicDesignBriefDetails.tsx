
import React from "react";
import CompanyInfoSection from "./graphic-design/CompanyInfoSection";
import ServicesMediaSection from "./graphic-design/ServicesMediaSection";
import TargetAudienceSection from "./graphic-design/TargetAudienceSection";
import MarketInformationSection from "./graphic-design/MarketInformationSection";
import LogoPreferencesSection from "./graphic-design/LogoPreferencesSection";
import CompetitorsReferencesSection from "./graphic-design/CompetitorsReferencesSection";

interface GraphicDesignBriefDetailsProps {
  briefDetails: any;
}

const GraphicDesignBriefDetails: React.FC<GraphicDesignBriefDetailsProps> = ({ briefDetails }) => {
  if (!briefDetails) {
    return <div>No brief details available.</div>;
  }

  // Extract company info
  const companyInfo = {
    companyName: briefDetails.companyName || briefDetails.company_name,
    aboutCompany: briefDetails.aboutCompany || briefDetails.about_company,
    visionMission: briefDetails.visionMission || briefDetails.vision_mission,
    slogan: briefDetails.slogan
  };

  // Extract services and media info
  const servicesMedia = {
    services: briefDetails.services,
    printMedia: briefDetails.printMedia || briefDetails.print_media,
    digitalMedia: briefDetails.digitalMedia || briefDetails.digital_media
  };

  // Extract target audience info
  const targetAudience = {
    targetAge: briefDetails.targetAge || briefDetails.target_age,
    targetGender: briefDetails.targetGender || briefDetails.target_gender,
    targetDemography: briefDetails.targetDemography || briefDetails.target_demography,
    targetProfession: briefDetails.targetProfession || briefDetails.target_profession,
    targetPersonality: briefDetails.targetPersonality || briefDetails.target_personality
  };

  // Extract market info
  const marketInfo = {
    productsServices: briefDetails.productsServices || briefDetails.products_services,
    featuresAndBenefits: briefDetails.featuresAndBenefits || briefDetails.features_and_benefits,
    marketCategory: briefDetails.marketCategory || briefDetails.market_category,
    brandPositioning: briefDetails.brandPositioning || briefDetails.brand_positioning,
    barrierToEntry: briefDetails.barrierToEntry || briefDetails.barrier_to_entry,
    specificImagery: briefDetails.specificImagery || briefDetails.specific_imagery
  };

  // Extract logo preferences
  const logoPreferences = {
    logoType: briefDetails.logoType || briefDetails.logo_type,
    logoFeelings: briefDetails.logoFeelings || briefDetails.logo_feelings
  };

  // Extract competitors and references
  const competitorsReferences = {
    competitor1: briefDetails.competitor1,
    competitor2: briefDetails.competitor2,
    competitor3: briefDetails.competitor3,
    competitor4: briefDetails.competitor4,
    reference1: briefDetails.reference1,
    reference2: briefDetails.reference2,
    reference3: briefDetails.reference3,
    reference4: briefDetails.reference4,
    specificImagery: briefDetails.specificImagery || briefDetails.specific_imagery
  };

  return (
    <div className="space-y-4">
      <CompanyInfoSection 
        aboutCompany={companyInfo.aboutCompany}
        visionMission={companyInfo.visionMission}
        slogan={companyInfo.slogan}
      />
      <ServicesMediaSection 
        services={servicesMedia.services}
        printMedia={servicesMedia.printMedia}
        digitalMedia={servicesMedia.digitalMedia}
      />
      <TargetAudienceSection 
        targetAge={targetAudience.targetAge}
        targetGender={targetAudience.targetGender}
        targetDemography={targetAudience.targetDemography}
        targetProfession={targetAudience.targetProfession}
        targetPersonality={targetAudience.targetPersonality}
      />
      <MarketInformationSection 
        productsServices={marketInfo.productsServices}
        featuresAndBenefits={marketInfo.featuresAndBenefits}
        marketCategory={marketInfo.marketCategory}
        brandPositioning={marketInfo.brandPositioning}
        barrierToEntry={marketInfo.barrierToEntry}
      />
      <LogoPreferencesSection 
        logoType={logoPreferences.logoType}
        logoFeelings={logoPreferences.logoFeelings}
      />
      <CompetitorsReferencesSection 
        competitor1={competitorsReferences.competitor1}
        competitor2={competitorsReferences.competitor2}
        competitor3={competitorsReferences.competitor3}
        competitor4={competitorsReferences.competitor4}
        reference1={competitorsReferences.reference1}
        reference2={competitorsReferences.reference2}
        reference3={competitorsReferences.reference3}
        reference4={competitorsReferences.reference4}
        specificImagery={competitorsReferences.specificImagery}
      />
    </div>
  );
};

export default GraphicDesignBriefDetails;
