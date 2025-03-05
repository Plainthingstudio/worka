import React from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { projects } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { baseChartStyles, chartColors } from "@/lib/chart-styles";

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
  
  return (
    <ResponsiveContainer width="100%" height={baseChartStyles.height}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          stroke={chartColors.muted}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.split(' ')[0]}
        />
        <YAxis
          stroke={chartColors.muted}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Line
          type="monotone"
          dataKey="started"
          stroke={chartColors.primary}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="completed"
          stroke="hsl(var(--primary) / 0.5)"
          strokeWidth={2}
          dot={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.background,
            border: `1px solid ${chartColors.border}`,
          }}
          formatter={(value, name) => [value, name === 'started' ? 'Projects Started' : 'Projects Completed']}
          labelFormatter={(label) => `${label}`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProjectCompletionChart;
