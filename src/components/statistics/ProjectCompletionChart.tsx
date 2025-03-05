
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { projects } from "@/mockData";
import { DateRange } from "@/types";
import { format, isWithinInterval, subMonths } from "date-fns";

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
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => value.split(' ')[0]} // Show only month abbreviation
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          formatter={(value, name) => [value, name === 'started' ? 'Projects Started' : 'Projects Completed']}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="started"
          name="Started"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="completed"
          name="Completed"
          stroke="#82ca9d"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProjectCompletionChart;
