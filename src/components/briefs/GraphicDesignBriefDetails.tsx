
import React from "react";
import { Separator } from "@/components/ui/separator";
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

  console.log("Logo feelings in GraphicDesignBriefDetails:", logoFeelings);

  return (
    <div className="space-y-6">
      {/* Company Information Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">About Company</h3>
        <CompanyInfoSection 
          aboutCompany={briefDetails.aboutCompany || briefDetails.about_company}
          visionMission={briefDetails.visionMission || briefDetails.vision_mission}
          slogan={briefDetails.slogan}
        />
      </section>
      
      <Separator />
      
      {/* Logo Preferences Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Logo Preferences</h3>
        <LogoPreferencesSection 
          logoFeelings={logoFeelings}
          logoType={briefDetails.logoType || briefDetails.logo_type}
        />
      </section>
      
      <Separator />
      
      {/* Target Audience Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Target Audience</h3>
        <TargetAudienceSection 
          targetAge={briefDetails.targetAge || briefDetails.target_age}
          targetGender={briefDetails.targetGender || briefDetails.target_gender}
          targetDemography={briefDetails.targetDemography || briefDetails.target_demography}
          targetProfession={briefDetails.targetProfession || briefDetails.target_profession}
          targetPersonality={briefDetails.targetPersonality || briefDetails.target_personality}
        />
      </section>
      
      <Separator />
      
      {/* Market Information Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Market Information</h3>
        <MarketInformationSection 
          productsServices={briefDetails.productsServices || briefDetails.products_services}
          featuresAndBenefits={briefDetails.featuresAndBenefits || briefDetails.features_and_benefits}
          marketCategory={briefDetails.marketCategory || briefDetails.market_category}
          brandPositioning={briefDetails.brandPositioning || briefDetails.brand_positioning}
          barrierToEntry={briefDetails.barrierToEntry || briefDetails.barrier_to_entry}
        />
      </section>
      
      <Separator />
      
      {/* Competitors & References Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Competitors & References</h3>
        <CompetitorsReferencesSection 
          competitor1={briefDetails.competitor1}
          competitor2={briefDetails.competitor2}
          competitor3={briefDetails.competitor3}
          competitor4={briefDetails.competitor4}
          reference1={briefDetails.reference1}
          reference2={briefDetails.reference2}
          reference3={briefDetails.reference3}
          reference4={briefDetails.reference4}
          specificImagery={briefDetails.specificImagery || briefDetails.specific_imagery}
        />
      </section>
      
      <Separator />
      
      {/* Services & Media Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Services & Media</h3>
        <ServicesMediaSection 
          services={briefDetails.services}
          printMedia={briefDetails.printMedia || briefDetails.print_media}
          digitalMedia={briefDetails.digitalMedia || briefDetails.digital_media}
        />
      </section>
    </div>
  );
};

export default GraphicDesignBriefDetails;
