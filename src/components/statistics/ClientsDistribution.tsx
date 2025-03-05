
import React from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend, Tooltip } from "recharts";
import { baseChartStyles, chartColors } from "@/lib/chart-styles";

interface ClientsDistributionProps {
  data: Record<string, number>;
}

const COLORS = [
  chartColors.primary,
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.2)",
];

const ClientsDistribution: React.FC<ClientsDistributionProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));
  
  return (
    <ResponsiveContainer width="100%" height={baseChartStyles.height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: chartColors.background,
            border: `1px solid ${chartColors.border}`,
          }}
          formatter={(value) => [`${value} clients`, '']}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span style={{ color: chartColors.muted }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ClientsDistribution;
