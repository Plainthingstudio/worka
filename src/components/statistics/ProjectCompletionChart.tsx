
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { projects } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { CHART_COLORS } from "@/lib/chart-styles";
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
    const startDate = subMonths(new Date(), 5); // Last 6 months
    const endDate = new Date();
    
    // Initialize monthly counts
    const months: string[] = [];
    const monthlyCompletions: { [key: string]: number } = {};
    const monthlyStarts: { [key: string]: number } = {};
    
    // Initialize past 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM");
      months.push(monthKey);
      monthlyCompletions[monthKey] = 0;
      monthlyStarts[monthKey] = 0;
    }
    
    // Count project starts and completions by month
    projects.forEach(project => {
      const creationDate = new Date(project.createdAt);
      
      // Count project starts
      if (creationDate >= startDate && creationDate <= endDate) {
        const startMonthKey = format(creationDate, "MMM");
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
          const completionMonthKey = format(completionDate, "MMM");
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
      color: CHART_COLORS.primary,
    },
    completed: {
      label: "Completed", 
      color: CHART_COLORS.lightBlue,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Project Completion</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{
              top: 16,
              right: 16,
              left: 16,
              bottom: 16,
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
              content={<ChartTooltipContent />} 
            />
            <Bar
              dataKey="started"
              radius={[4, 4, 0, 0]}
              fill={CHART_COLORS.primary}
              name="Started"
            />
            <Bar
              dataKey="completed"
              radius={[4, 4, 0, 0]}
              fill={CHART_COLORS.lightBlue}
              name="Completed"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-6">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month
        </div>
        <div className="text-muted-foreground">
          Comparing project starts and completions over time
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCompletionChart;
