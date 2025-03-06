
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { clients } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths, isWithinInterval } from "date-fns";
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

interface StatisticsChartsProps {
  dateRange: DateRange;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ dateRange }) => {
  const getMonthlyData = () => {
    const endDate = new Date();
    const startDate = subMonths(endDate, 5); // Last 6 months (current + 5 previous)
    
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
      if (isWithinInterval(creationDate, { start: startDate, end: endDate })) {
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
  const startMonth = format(subMonths(new Date(), 5), "MMMM");
  const endMonth = format(new Date(), "MMMM yyyy");
  const dateRangeText = `${startMonth} - ${endMonth}`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Client Growth</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0 py-0">
        <div className="h-[280px] w-full px-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                left: 10,
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
                height={30}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dx={-5}
                width={40}
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
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4 pb-4 px-6 mt-auto">
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
