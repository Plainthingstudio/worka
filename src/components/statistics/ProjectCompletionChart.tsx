
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
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
    
    // Initialize past 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM");
      months.push(monthKey);
      monthlyCompletions[monthKey] = 0;
    }
    
    // Count completed projects by month
    projects.forEach(project => {
      if (project.status === 'Completed') {
        // For this mock data, let's assume completion date is the project deadline if status is completed
        const completionDate = new Date(project.deadline);
        
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
      completed: monthlyCompletions[month],
    }));
  };

  const data = getMonthlyCompletionData();
  
  // Create chart config
  const chartConfig: ChartConfig = {
    completed: {
      label: "Completed", 
      color: CHART_COLORS.lightBlue,
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Project Completion</CardTitle>
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
                dx={-5}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }}
                content={
                  <ChartTooltipContent 
                    formatter={(value: number) => [`${value} projects`, 'Completed']} 
                    hideLabel 
                  />
                }
              />
              <Bar
                dataKey="completed"
                radius={[4, 4, 0, 0]}
                fill={CHART_COLORS.lightBlue}
                name="Completed"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month
        </div>
        <div className="text-muted-foreground">
          Showing completed projects over time
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCompletionChart;
