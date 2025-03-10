
import React from "react";
import BriefStatCard from "@/components/briefs/BriefStatCard";

interface BriefStatsProps {
  briefs: any[];
}

const BriefStats: React.FC<BriefStatsProps> = ({ briefs }) => {
  const statCounts = {
    total: briefs.length,
    ui: briefs.filter(b => b.type === "UI Design").length,
    graphic: briefs.filter(b => b.type === "Graphic Design").length,
    illustrations: briefs.filter(b => b.type === "Illustration Design").length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <BriefStatCard title="Total Briefs" count={statCounts.total} />
      <BriefStatCard title="UI Design" count={statCounts.ui} />
      <BriefStatCard title="Graphic Design" count={statCounts.graphic} />
      <BriefStatCard title="Illustration Design" count={statCounts.illustrations} />
    </div>
  );
};

export default BriefStats;
