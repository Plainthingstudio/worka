
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
      color: "hsl(var(--chart-1))",
    },
  };
  
  // Calculate total earnings for this period and growth percentage
  const currentMonthEarnings = data[data.length - 1]?.earnings || 0;
  const previousMonthEarnings = data[data.length - 2]?.earnings || 0;
  const growthPercentage = previousMonthEarnings > 0 
    ? ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100 
    : 0;
  const growthIsPositive = growthPercentage >= 0;
  
  // Date range display
  const dateRangeText = `${format(subMonths(new Date(), 11), "MMM yyyy")} - ${format(new Date(), "MMM yyyy")}`;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Earnings Over Time</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig}>
          <BarChart
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
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value: number) => [`$${value.toLocaleString()}`, 'Earnings']} />}
            />
            <Bar 
              dataKey="earnings" 
              fill="var(--color-earnings)" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-6">
        <div className="flex gap-2 font-medium leading-none">
          {growthIsPositive ? 'Trending up' : 'Trending down'} by {Math.abs(growthPercentage).toFixed(1)}% this month
          <TrendingUp className={`h-4 w-4 ${growthIsPositive ? 'text-green-500' : 'text-red-500 transform rotate-180'}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total earnings for the last 12 months
        </div>
      </CardFooter>
    </Card>
  );
};

export default EarningsSummary;
