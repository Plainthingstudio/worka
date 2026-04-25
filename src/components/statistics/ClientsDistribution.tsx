import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "@/lib/chart-styles";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ClientsDistributionProps {
  data: Record<string, number>;
}

const ClientsDistribution: React.FC<ClientsDistributionProps> = ({
  data
}) => {
  // Transform data for the chart
  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    fill: index % 2 === 0 ? CHART_COLORS.blue : CHART_COLORS.lightBlue
  }));

  // Calculate total clients
  const totalClients = chartData.reduce((sum, item) => sum + item.value, 0);

  // Create chart config
  const chartConfig: ChartConfig = {
    value: {
      label: "Clients",
      color: CHART_COLORS.primary
    }
  };

  // Sort data by value in descending order
  chartData.sort((a, b) => b.value - a.value);
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Lead Sources</CardTitle>
        <CardDescription>Distribution of client acquisition channels</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0 py-0">
        <div className="h-[280px] w-full px-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 24
            }} barSize={36}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLORS.gray} opacity={0.3} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              }} dy={10} />
              <YAxis tickLine={false} axisLine={false} tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12
              }} dx={-5} />
              <Tooltip cursor={{
                fill: 'rgba(200, 200, 200, 0.1)'
              }} content={({
                active,
                payload
              }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return <div className="rounded-lg border bg-card p-2 shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">{data.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {data.value} clients ({(data.value / totalClients * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>;
                }
                return null;
              }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4 pb-4 px-6 mt-auto">
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
