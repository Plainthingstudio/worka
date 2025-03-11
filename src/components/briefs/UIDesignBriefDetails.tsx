
import React from "react";
import CompanySection from "./ui-design/CompanySection";
import ProjectSection from "./ui-design/ProjectSection";
import CompetitorsSection from "./ui-design/CompetitorsSection";
import BrandSection from "./ui-design/BrandSection";
import DesignPreferencesSection from "./ui-design/DesignPreferencesSection";
import PageDetailsSection from "./ui-design/PageDetailsSection";
import ProjectDeliverySection from "./ui-design/ProjectDeliverySection";

interface UIDesignBriefDetailsProps {
  briefDetails: any;
}

const UIDesignBriefDetails: React.FC<UIDesignBriefDetailsProps> = ({ briefDetails }) => {
  console.log("UI design brief details:", briefDetails);

  return (
    <div className="space-y-4">
      <CompanySection briefDetails={briefDetails} />
      <ProjectSection briefDetails={briefDetails} />
      <CompetitorsSection briefDetails={briefDetails} />
      <BrandSection briefDetails={briefDetails} />
      <DesignPreferencesSection briefDetails={briefDetails} />
      <PageDetailsSection briefDetails={briefDetails} />
      <ProjectDeliverySection briefDetails={briefDetails} />
    </div>
  );
};

export default UIDesignBriefDetails;
