
import React from "react";
import { DateRange, Client, Project } from "@/types";
import EarningsSummary from "@/components/statistics/EarningsSummary";
import ClientsDistribution from "@/components/statistics/ClientsDistribution";
import ProjectCompletionChart from "@/components/statistics/ProjectCompletionChart";
import StatisticsCharts from "@/components/statistics/StatisticsCharts";

interface StatisticsChartGridProps {
  dateRange: DateRange;
  leadSources: Record<string, number>;
  clients: Client[];
  projects: Project[];
}

const StatisticsChartGrid: React.FC<StatisticsChartGridProps> = ({ 
  dateRange, 
  leadSources,
  clients,
  projects
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <EarningsSummary dateRange={dateRange} projects={projects} />
      <ClientsDistribution data={leadSources} />
      <ProjectCompletionChart dateRange={dateRange} projects={projects} />
      <StatisticsCharts dateRange={dateRange} clients={clients} />
    </div>
  );
};

export default StatisticsChartGrid;
