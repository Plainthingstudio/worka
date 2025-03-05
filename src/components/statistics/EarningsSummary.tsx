
import React from "react";
import { 
  BarChart, 
  Bar, 
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
      const monthKey = format(date, "MMM yyyy");
      months.push(monthKey);
      monthlyEarnings[monthKey] = 0;
    }
    
    // Sum earnings by project creation month
    projects.forEach(project => {
      const creationDate = new Date(project.createdAt);
      if (creationDate >= startDate && creationDate <= endDate) {
        const monthKey = format(creationDate, "MMM yyyy");
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
      earnings: monthlyEarnings[month],
    }));
  };

  const data = getMonthlyData();
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
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
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Earnings']}
          labelFormatter={(label) => `${label}`}
        />
        <Legend />
        <Bar dataKey="earnings" name="Monthly Earnings" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EarningsSummary;
