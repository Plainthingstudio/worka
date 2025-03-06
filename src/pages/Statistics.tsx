
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { clients, projects } from "@/mockData";
import { DateRange } from "@/types";
import StatisticsHeader from "@/components/statistics/StatisticsHeader";
import StatisticsSummaryCards from "@/components/statistics/StatisticsSummaryCards";
import StatisticsChartGrid from "@/components/statistics/StatisticsChartGrid";

const Statistics = () => {
  const [timeFilter, setTimeFilter] = useState<string>("this-month");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const leadSources = clients.reduce((acc: Record<string, number>, client) => {
    const source = client.leadSource;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={`flex-1 w-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "pl-56" : "pl-14"
        }`}
      >
        <Navbar title="Statistics" />
        <main className="container py-6 px-4">
          <StatisticsHeader 
            timeFilter={timeFilter}
            dateRange={dateRange}
            setTimeFilter={setTimeFilter}
            setDateRange={setDateRange}
          />
          
          <StatisticsSummaryCards 
            clients={clients} 
            projects={projects} 
          />
          
          <StatisticsChartGrid 
            dateRange={dateRange} 
            leadSources={leadSources} 
          />
        </main>
      </div>
    </div>
  );
};

export default Statistics;
