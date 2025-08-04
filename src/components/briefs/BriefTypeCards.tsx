
import React from "react";
import { LayoutDashboard, Palette, PencilRuler } from "lucide-react";
import BriefTypeCard from "./BriefTypeCard";

const BriefTypeCards: React.FC = () => {
  const briefTypeCards = [
    {
      title: "UI Design Brief",
      description: "Get detailed information about your UI design project needs",
      content: "Form for websites, web apps, and other digital interfaces design projects.",
      route: "/brief/ui",
      icon: LayoutDashboard,
      iconColor: "text-blue-500"
    },
    {
      title: "Graphic Design Brief",
      description: "Get detailed information about your graphic design project needs",
      content: "Form for logos, branding, print materials, and other graphic design projects.",
      route: "/brief/graphic",
      icon: Palette,
      iconColor: "text-purple-500"
    },
    {
      title: "Illustrations Brief",
      description: "Get detailed information about your illustration project needs",
      content: "Form for custom illustrations, icons, infographics and other illustration projects.",
      route: "/brief/illustration",
      icon: PencilRuler,
      iconColor: "text-amber-500"
    }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Brief Types</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {briefTypeCards.map((card, index) => (
          <BriefTypeCard
            key={index}
            title={card.title}
            description={card.description}
            content={card.content}
            route={card.route}
            icon={card.icon}
            iconColor={card.iconColor}
          />
        ))}
      </div>
    </div>
  );
};

export default BriefTypeCards;
