
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { clients } from "@/mockData";
import { DateRange } from "@/types";
import { format, isWithinInterval, subMonths } from "date-fns";

interface StatisticsChartsProps {
  dateRange: DateRange;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ dateRange }) => {
  // Generate monthly client growth data
  const getMonthlyData = () => {
    const startDate = subMonths(new Date(), 11); // Last 12 months
    const endDate = new Date();
    
    // Initialize monthly counts
    const months: string[] = [];
    const monthlyCounts: { [key: string]: number } = {};
    
    // Initialize past 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM yyyy");
      months.push(monthKey);
      monthlyCounts[monthKey] = 0;
    }
    
    // Count clients by creation month
    clients.forEach(client => {
      const creationDate = new Date(client.createdAt);
      if (creationDate >= startDate && creationDate <= endDate) {
        const monthKey = format(creationDate, "MMM yyyy");
        if (monthlyCounts[monthKey] !== undefined) {
          monthlyCounts[monthKey]++;
        }
      }
    });
    
    // Create cumulative data (total clients over time)
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
          formatter={(value) => [`${value} clients`, 'Total Clients']}
          labelFormatter={(label) => `${label}`}
        />
        <Line
          type="monotone"
          dataKey="clients"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StatisticsCharts;
