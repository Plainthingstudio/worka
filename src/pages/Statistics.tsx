import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  ChartBar,
  Users,
  TrendingUp,
  Gauge,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import StatisticsCharts from "@/components/statistics/StatisticsCharts";
import EarningsSummary from "@/components/statistics/EarningsSummary";
import ClientsDistribution from "@/components/statistics/ClientsDistribution";
import ProjectCompletionChart from "@/components/statistics/ProjectCompletionChart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { clients, projects } from "@/mockData";
import { DateRange } from "@/types";

const Statistics = () => {
  const [timeFilter, setTimeFilter] = useState<string>("this-month");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const totalEarnings = projects.reduce((sum, project) => {
    const amountInUSD = project.currency === 'IDR' ? project.fee / 15000 : project.fee;
    return sum + amountInUSD;
  }, 0);
  
  const averagePayment = totalEarnings / projects.length;
  
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  
  const leadSources = clients.reduce((acc: Record<string, number>, client) => {
    const source = client.leadSource;
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  React.useEffect(() => {
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

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    
    const now = new Date();
    let from = new Date();
    
    switch (value) {
      case "this-month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last-month":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "this-quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case "this-year":
        from = new Date(now.getFullYear(), 0, 1);
        break;
      case "last-year":
        from = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    setDateRange({ from, to: now });
  };

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
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-1">Statistics Dashboard</h1>
                <p className="text-muted-foreground">
                  Track your business performance and metrics
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row items-center">
                <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-quarter">This Quarter</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                
                {timeFilter === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range: any) => setDateRange(range)}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 10) + 1}% from previous period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${averagePayment.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Per project average
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 15) + 5}% from previous period
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
                <ChartBar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {((completedProjects / projects.length) * 100).toFixed(0)}% completion rate
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6 mb-6">
            <EarningsSummary dateRange={dateRange} />
            <ClientsDistribution data={leadSources} />
            <ProjectCompletionChart dateRange={dateRange} />
            <StatisticsCharts dateRange={dateRange} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistics;
