import React from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { projects } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { baseChartStyles, chartColors } from "@/lib/chart-styles";

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
    <ResponsiveContainer width="100%" height={baseChartStyles.height}>
      <BarChart data={data}>
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
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Bar
          dataKey="earnings"
          fill={chartColors.primary}
          radius={[4, 4, 0, 0]}
        />
        <Tooltip
          cursor={{ fill: chartColors.accent }}
          contentStyle={{
            backgroundColor: chartColors.background,
            border: `1px solid ${chartColors.border}`,
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Earnings']}
          labelFormatter={(label) => `${label}`}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EarningsSummary;
