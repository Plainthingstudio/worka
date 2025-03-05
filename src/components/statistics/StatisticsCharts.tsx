import React from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { clients } from "@/mockData";
import { DateRange } from "@/types";
import { format, subMonths } from "date-fns";
import { baseChartStyles, chartColors } from "@/lib/chart-styles";

interface StatisticsChartsProps {
  dateRange: DateRange;
}

const StatisticsCharts: React.FC<StatisticsChartsProps> = ({ dateRange }) => {
  const getMonthlyData = () => {
    const startDate = subMonths(new Date(), 11); // Last 12 months
    const endDate = new Date();
    
    const months: string[] = [];
    const monthlyCounts: { [key: string]: number } = {};
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM yyyy");
      months.push(monthKey);
      monthlyCounts[monthKey] = 0;
    }
    
    clients.forEach(client => {
      const creationDate = new Date(client.createdAt);
      if (creationDate >= startDate && creationDate <= endDate) {
        const monthKey = format(creationDate, "MMM yyyy");
        if (monthlyCounts[monthKey] !== undefined) {
          monthlyCounts[monthKey]++;
        }
      }
    });
    
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
          dataKey="clients"
          stroke={chartColors.primary}
          strokeWidth={2}
          dot={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.background,
            border: `1px solid ${chartColors.border}`,
          }}
          formatter={(value) => [`${value} clients`, 'Total Clients']}
          labelFormatter={(label) => `${label}`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StatisticsCharts;
