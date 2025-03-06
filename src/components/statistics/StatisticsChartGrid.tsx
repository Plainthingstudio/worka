
import React from "react";
import { DateRange } from "@/types";
import EarningsSummary from "@/components/statistics/EarningsSummary";
import ClientsDistribution from "@/components/statistics/ClientsDistribution";
import ProjectCompletionChart from "@/components/statistics/ProjectCompletionChart";
import StatisticsCharts from "@/components/statistics/StatisticsCharts";

interface StatisticsChartGridProps {
  dateRange: DateRange;
  leadSources: Record<string, number>;
}

const StatisticsChartGrid: React.FC<StatisticsChartGridProps> = ({ dateRange, leadSources }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <EarningsSummary dateRange={dateRange} />
      <ClientsDistribution data={leadSources} />
      <ProjectCompletionChart dateRange={dateRange} />
      <StatisticsCharts dateRange={dateRange} />
    </div>
  );
};

export default StatisticsChartGrid;
