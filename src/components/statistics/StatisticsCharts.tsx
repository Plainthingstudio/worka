
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { clients } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { TrendingUp } from "lucide-react";
import { CHART_COLORS } from "@/lib/chart-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface StatisticsChartsProps {
  dateRange: DateRange;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ dateRange }) => {
  const getMonthlyData = () => {
    const startDate = subMonths(new Date(), 5); // Last 6 months
    const endDate = new Date();
    
    const months: string[] = [];
    const monthlyCounts: { [key: string]: number } = {};
    
    for (let i = 0; i < 6; i++) {
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
      color: CHART_COLORS.primary,
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Client Growth</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[280px] w-full">
          <ChartContainer config={chartConfig}>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
              }}
              barSize={28}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLORS.gray} opacity={0.3} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={8}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dx={-5}
              />
              <Tooltip
                cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card p-2 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">{data.month}</span>
                          <span className="text-sm font-bold">
                            {data.clients} total clients
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="clients"
                radius={[4, 4, 0, 0]}
                fill={CHART_COLORS.primary}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-2 pb-4">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          Showing total clients growth for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatisticsCharts;
