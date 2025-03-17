
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
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
  projects: Project[];
}

const ProjectCompletionChart: React.FC<ProjectCompletionChartProps> = ({ 
  dateRange, 
  projects 
}) => {
  const getMonthlyCompletionData = () => {
    const today = new Date();
    const endDate = today;
    const startDate = subMonths(endDate, 5);
    
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
    
    // Count completed projects by month based on the project's createdAt date
    // since we're assuming completed projects were marked completed around their creation date
    // (We don't have an updatedAt or completedAt field)
    const completedProjects = projects.filter((project: Project) => project.status === 'Completed');
    
    completedProjects.forEach(project => {
      const completionDate = new Date(project.createdAt);
      
      // Check if within our 6-month window
      if (isWithinInterval(completionDate, { start: startDate, end: endDate })) {
        const monthKey = format(completionDate, "MMM");
        
        if (monthlyCompletions[monthKey] !== undefined) {
          monthlyCompletions[monthKey]++;
        }
      }
    });

    return months.map(month => ({
      month,
      completed: monthlyCompletions[month],
    }));
  };

  const data = getMonthlyCompletionData();
  
  const totalCompleted = projects.filter(p => p.status === 'Completed').length;
  const completionRate = projects.length > 0 
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
          {totalCompleted} projects completed in total
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          {projects.length > 0 ? 
            `${completionRate}% overall completion rate (${totalCompleted}/${projects.length})` :
            "No project data available"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCompletionChart;
