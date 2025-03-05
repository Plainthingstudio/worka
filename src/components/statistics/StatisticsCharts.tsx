
import React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { clients } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { createChartConfig } from "@/lib/chart-styles";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Users } from "lucide-react";

interface StatisticsChartsProps {
  dateRange: DateRange;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ dateRange }) => {
  const getMonthlyData = () => {
    const startDate = subMonths(new Date(), 11); // Last 12 months
    const endDate = new Date();
    
    const months: string[] = [];
    const monthlyCounts: { [key: string]: number } = {};
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM");
      months.push(monthKey);
      monthlyCounts[monthKey] = 0;
    }
    
    clients.forEach(client => {
      const creationDate = new Date(client.createdAt);
      if (creationDate >= startDate && creationDate <= endDate) {
        const monthKey = format(creationDate, "MMM");
        if (monthlyCounts[monthKey] !== undefined) {
          monthlyCounts[monthKey]++;
        }
      }
    });
    
    const data = [];
    let cumulativeCount = 0;
    
    for (const month of months) {
      cumulativeCount += monthlyCounts[month];
      data.push({
        month,
        clients: cumulativeCount,
      });
    }
    
    return data;
  };

  const data = getMonthlyData();
  
  // Create chart config
  const chartConfig: ChartConfig = {
    clients: {
      label: "Clients",
      color: "hsl(var(--chart-1))",
    },
  };
  
  // Calculate growth metrics
  const totalClients = data[data.length - 1]?.clients || 0;
  const growthThisYear = totalClients - (data[0]?.clients || 0);
  const growthPercentage = (data[0]?.clients || 0) > 0 
    ? (growthThisYear / (data[0]?.clients || 1)) * 100 
    : 100;
  
  // Date range display
  const dateRangeText = `${format(subMonths(new Date(), 11), "MMM yyyy")} - ${format(new Date(), "MMM yyyy")}`;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Client Growth</CardTitle>
        <CardDescription>Cumulative client acquisition over time</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 10,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip 
              content={
                <ChartTooltipContent 
                  formatter={(value: number) => [`${value} clients`, 'Total Clients']} 
                />
              } 
            />
            <Line
              type="monotone"
              dataKey="clients"
              strokeWidth={2}
              stroke="var(--color-clients)"
              dot={false}
              activeDot={{ r: 6, fill: "var(--color-clients)" }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-6">
        <div className="flex gap-2 font-medium leading-none">
          {growthPercentage > 0 ? `+${growthPercentage.toFixed(1)}%` : `${growthPercentage.toFixed(1)}%`} growth this year
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="leading-none text-muted-foreground">
          Added {growthThisYear} new clients in the past 12 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatisticsCharts;
