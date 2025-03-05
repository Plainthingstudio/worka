
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { projects } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CHART_COLORS } from "@/lib/chart-styles";

interface EarningsSummaryProps {
  dateRange: DateRange;
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({ dateRange }) => {
  const getMonthlyData = () => {
    const startDate = subMonths(new Date(), 11); // Last 12 months
    const endDate = new Date();
    
    // Initialize monthly counts
    const months: string[] = [];
    const monthlyEarnings: { [key: string]: number } = {};
    
    // Initialize past 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM");
      months.push(monthKey);
      monthlyEarnings[monthKey] = 0;
    }
    
    // Sum earnings by project creation month
    projects.forEach(project => {
      const creationDate = new Date(project.createdAt);
      if (creationDate >= startDate && creationDate <= endDate) {
        const monthKey = format(creationDate, "MMM");
        if (monthlyEarnings[monthKey] !== undefined) {
          // Convert to USD if needed
          const amountInUSD = project.currency === 'IDR' ? project.fee / 15000 : project.fee;
          monthlyEarnings[monthKey] += amountInUSD;
        }
      }
    });
    
    // Create data array
    return months.map(month => ({
      month,
      earnings: Math.round(monthlyEarnings[month]),
    }));
  };

  const data = getMonthlyData();
  
  // Create chart config
  const chartConfig: ChartConfig = {
    earnings: {
      label: "Earnings",
      color: CHART_COLORS.primary,
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Earnings Over Time</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 25,
                left: 25,
                bottom: 30,
              }}
              barSize={32}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLORS.gray} opacity={0.3} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                dx={-5}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
                content={
                  <ChartTooltipContent 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Earnings']} 
                    hideLabel 
                  />
                }
              />
              <Bar
                dataKey="earnings"
                radius={[4, 4, 0, 0]}
                fill={CHART_COLORS.primary}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          Showing total earnings for the last 12 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default EarningsSummary;
