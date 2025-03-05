
import React from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { projects } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { Check } from "lucide-react";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface ProjectCompletionChartProps {
  dateRange: DateRange;
}

const ProjectCompletionChart: React.FC<ProjectCompletionChartProps> = ({ dateRange }) => {
  const getMonthlyCompletionData = () => {
    const startDate = subMonths(new Date(), 11); // Last 12 months
    const endDate = new Date();
    
    // Initialize monthly counts
    const months: string[] = [];
    const monthlyCompletions: { [key: string]: number } = {};
    const monthlyStarts: { [key: string]: number } = {};
    
    // Initialize past 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM yyyy");
      months.push(monthKey);
      monthlyCompletions[monthKey] = 0;
      monthlyStarts[monthKey] = 0;
    }
    
    // Count project starts and completions by month
    projects.forEach(project => {
      const creationDate = new Date(project.createdAt);
      
      // Count project starts
      if (creationDate >= startDate && creationDate <= endDate) {
        const startMonthKey = format(creationDate, "MMM yyyy");
        if (monthlyStarts[startMonthKey] !== undefined) {
          monthlyStarts[startMonthKey]++;
        }
      }
      
      // Count completed projects
      if (project.status === 'Completed') {
        // For this mock data, let's assume completion date is either:
        // 1. The project deadline if status is completed
        // 2. Or a random date between creation and deadline
        let completionDate;
        if (project.status === 'Completed') {
          completionDate = new Date(project.deadline);
        } else {
          const creationTime = creationDate.getTime();
          const deadlineTime = new Date(project.deadline).getTime();
          const randomTime = creationTime + Math.random() * (deadlineTime - creationTime);
          completionDate = new Date(randomTime);
        }
        
        if (completionDate >= startDate && completionDate <= endDate) {
          const completionMonthKey = format(completionDate, "MMM yyyy");
          if (monthlyCompletions[completionMonthKey] !== undefined) {
            monthlyCompletions[completionMonthKey]++;
          }
        }
      }
    });
    
    // Create data array
    return months.map(month => ({
      month,
      started: monthlyStarts[month],
      completed: monthlyCompletions[month],
    }));
  };

  const data = getMonthlyCompletionData();
  
  // Create chart config
  const chartConfig: ChartConfig = {
    started: {
      label: "Started",
      color: "hsl(var(--chart-1))",
    },
    completed: {
      label: "Completed", 
      color: "hsl(var(--chart-2))",
    },
  };
  
  // Calculate completion rate
  const totalStarted = data.reduce((sum, item) => sum + item.started, 0);
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Project Completion</CardTitle>
        <CardDescription>Started vs. completed projects timeline</CardDescription>
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
              tickFormatter={(value) => value.split(' ')[0]}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />} 
            />
            <Line
              type="monotone"
              dataKey="started"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-6">
        <div className="flex gap-2 font-medium leading-none">
          {completionRate.toFixed(1)}% completion rate overall <Check className="h-4 w-4 text-green-500" />
        </div>
        <div className="leading-none text-muted-foreground">
          Comparing project starts and completions over time
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCompletionChart;
