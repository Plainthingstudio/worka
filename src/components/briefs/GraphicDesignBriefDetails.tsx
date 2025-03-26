
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
    company_name: briefDetails.companyName || briefDetails.company_name,
    about_company: briefDetails.aboutCompany || briefDetails.about_company,
    vision_mission: briefDetails.visionMission || briefDetails.vision_mission,
    slogan: briefDetails.slogan
  };

  // Extract services and media info
  const servicesMedia = {
    services: briefDetails.services,
    print_media: briefDetails.printMedia || briefDetails.print_media,
    digital_media: briefDetails.digitalMedia || briefDetails.digital_media
  };

  // Extract target audience info
  const targetAudience = {
    target_age: briefDetails.targetAge || briefDetails.target_age,
    target_gender: briefDetails.targetGender || briefDetails.target_gender,
    target_demography: briefDetails.targetDemography || briefDetails.target_demography,
    target_profession: briefDetails.targetProfession || briefDetails.target_profession,
    target_personality: briefDetails.targetPersonality || briefDetails.target_personality
  };

  // Extract market info
  const marketInfo = {
    products_services: briefDetails.productsServices || briefDetails.products_services,
    features_and_benefits: briefDetails.featuresAndBenefits || briefDetails.features_and_benefits,
    market_category: briefDetails.marketCategory || briefDetails.market_category,
    brand_positioning: briefDetails.brandPositioning || briefDetails.brand_positioning,
    barrier_to_entry: briefDetails.barrierToEntry || briefDetails.barrier_to_entry,
    specific_imagery: briefDetails.specificImagery || briefDetails.specific_imagery
  };

  // Extract logo preferences
  const logoPreferences = {
    logo_type: briefDetails.logoType || briefDetails.logo_type,
    logo_feelings: briefDetails.logoFeelings || briefDetails.logo_feelings
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
    reference4: briefDetails.reference4
  };

  return (
    <div className="space-y-4">
      <CompanyInfoSection 
        briefData={companyInfo} 
      />
      <ServicesMediaSection 
        briefData={servicesMedia} 
      />
      <TargetAudienceSection 
        briefData={targetAudience} 
      />
      <MarketInformationSection 
        briefData={marketInfo} 
      />
      <LogoPreferencesSection 
        briefData={logoPreferences} 
      />
      <CompetitorsReferencesSection 
        briefData={competitorsReferences} 
      />
    </div>
  );
};

export default GraphicDesignBriefDetails;
