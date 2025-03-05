
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CHART_COLORS } from "@/lib/chart-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ClientsDistributionProps {
  data: Record<string, number>;
}

const ClientsDistribution: React.FC<ClientsDistributionProps> = ({ data }) => {
  // Transform data for the chart
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Calculate total clients
  const totalClients = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Create chart config
  const chartConfig: ChartConfig = {
    value: {
      label: "Clients",
      color: CHART_COLORS.primary,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Lead Sources</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer 
          config={chartConfig}
          className="aspect-[1.2/1] h-[300px]"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 16,
              right: 16,
              left: 16,
              bottom: 16,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent 
                  formatter={(value: number, name: string) => [
                    `${value} clients (${((value / totalClients) * 100).toFixed(1)}%)`, 
                    name
                  ]}
                  hideLabel
                />
              } 
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              fill={CHART_COLORS.primary}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-6">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month
        </div>
        <div className="text-muted-foreground">
          Showing distribution across {Object.keys(data).length} acquisition channels
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientsDistribution;
