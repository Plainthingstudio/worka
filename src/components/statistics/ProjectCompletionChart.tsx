
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { projects } from "@/mockData";
import { DateRange, Project } from "@/types";
import { format, isWithinInterval, subMonths } from "date-fns";
import { CHART_COLORS } from "@/lib/chart-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ProjectCompletionChartProps {
  dateRange: DateRange;
}

const ProjectCompletionChart: React.FC<ProjectCompletionChartProps> = ({ dateRange }) => {
  // Log projects data to debug
  console.log("All projects:", projects);
  console.log("Completed projects:", projects.filter(p => p.status === 'Completed'));

  const getMonthlyCompletionData = () => {
    const today = new Date();
    const endDate = today;
    const startDate = subMonths(endDate, 5);
    
    console.log("Date range for chart:", { startDate, endDate });
    
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
    
    // Count actual completed projects by month
    // For this demo, we'll use the project's createdAt date to determine when it was completed
    // In a real application, you might have a completedAt field
    const completedProjects = projects.filter((project: Project) => project.status === 'Completed');
    
    console.log("Filtered completed projects:", completedProjects);
    
    completedProjects.forEach(project => {
      // For demonstration purposes, we'll use the createdAt date as a proxy for completion date
      // In a real app, you might have a separate completedAt date field
      const completionDate = new Date(project.createdAt);
      
      console.log(`Project "${project.name}" created at:`, completionDate);
      
      // Check if within our 6-month window
      if (isWithinInterval(completionDate, { start: startDate, end: endDate })) {
        const monthKey = format(completionDate, "MMM");
        console.log(`Project "${project.name}" completion falls in month:`, monthKey);
        
        if (monthlyCompletions[monthKey] !== undefined) {
          monthlyCompletions[monthKey]++;
        }
      }
    });
    
    console.log("Monthly completions data:", monthlyCompletions);

    return months.map(month => ({
      month,
      completed: monthlyCompletions[month],
    }));
  };

  const data = getMonthlyCompletionData();
  console.log("Chart data:", data);
  
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const completionRate = totalCompleted > 0 
    ? ((totalCompleted / projects.length) * 100).toFixed(0) 
    : "0";
    
  const startMonth = format(subMonths(new Date(), 5), "MMMM");
  const endMonth = format(new Date(), "MMMM yyyy");
  const dateRangeText = `${startMonth} - ${endMonth}`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Project Completion</CardTitle>
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
                bottom: 5,
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
                            {data.completed} completed projects
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
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
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4 pb-4 px-6 mt-auto">
        <div className="flex items-center gap-2 font-medium leading-none">
          {totalCompleted} projects completed in the last 6 months
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          {completionRate}% overall completion rate
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCompletionChart;
