import React, { useState, useEffect } from "react";
import { DateRange } from "@/types";
import StatisticsHeader from "@/components/statistics/StatisticsHeader";
import StatisticsSummaryCards from "@/components/statistics/StatisticsSummaryCards";
import StatisticsChartGrid from "@/components/statistics/StatisticsChartGrid";
import { useStatisticsData } from "@/hooks/useStatisticsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
const Statistics = () => {
  const [timeFilter, setTimeFilter] = useState<string>("this-month");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const {
    clients,
    projects,
    isLoading,
    error
  } = useStatisticsData();

  // Calculate lead sources from actual client data
  const leadSources = clients.reduce((acc: Record<string, number>, client) => {
    const source = client.leadSource || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  useEffect(() => {
    // Remove sidebar width detection since Layout handles this now
  }, []);
  const renderLoadingState = () => <div className="space-y-6">
      <div className="flex justify-center items-center h-12 mb-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading statistics...</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-md" />)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-96 rounded-md" />)}
      </div>
    </div>;
  return <div className="container py-6 px-[24px]">
      <StatisticsHeader timeFilter={timeFilter} dateRange={dateRange} setTimeFilter={setTimeFilter} setDateRange={setDateRange} />
      
      {isLoading ? renderLoadingState() : error ? <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-2">Error loading statistics</p>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </div> : <>
          <StatisticsSummaryCards clients={clients} projects={projects} />
          
          <StatisticsChartGrid dateRange={dateRange} leadSources={leadSources} clients={clients} projects={projects} />
        </>}
    </div>;
};
export default Statistics;