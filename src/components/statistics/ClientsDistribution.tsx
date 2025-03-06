
import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "@/lib/chart-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClientsDistributionProps {
  data: Record<string, number>;
}

const ClientsDistribution: React.FC<ClientsDistributionProps> = ({ data }) => {
  // Transform data for the chart
  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    fill: index % 2 === 0 ? CHART_COLORS.blue : CHART_COLORS.lightBlue,
  }));
  
  // Calculate total clients
  const totalClients = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Sort data by value in descending order
  chartData.sort((a, b) => b.value - a.value);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Lead Sources</CardTitle>
        <CardDescription>Distribution of client acquisition channels</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 0
            }}
            barSize={36}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLORS.gray} opacity={0.3} />
            <XAxis 
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              dy={8}
              padding={{
                left: 10,
                right: 10
              }}
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
                        <span className="text-sm font-bold text-foreground">{data.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {data.value} clients ({((data.value / totalClients) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-2 pb-4 px-6">
        <div className="flex items-center gap-2 font-medium leading-none">
          {chartData.length} active acquisition channels
        </div>
        <div className="text-muted-foreground">
          Top source: {chartData[0]?.name || 'N/A'} ({chartData[0]?.value || 0} clients)
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientsDistribution;
