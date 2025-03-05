
import React from "react";
import { Pie, PieChart } from "recharts";
import { DONUT_COLORS } from "@/lib/chart-styles";
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
  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    fill: DONUT_COLORS[index % DONUT_COLORS.length],
  }));
  
  // Calculate total clients
  const totalClients = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Create chart config
  const chartConfig: ChartConfig = {
    value: {
      label: "Clients",
    },
    ...Object.fromEntries(
      Object.keys(data).map((key, index) => [
        key,
        {
          label: key,
          color: DONUT_COLORS[index % DONUT_COLORS.length],
        },
      ])
    ),
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
        <CardDescription>Distribution of client acquisition channels</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer 
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
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
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-6">
        <div className="leading-none text-muted-foreground">
          Showing distribution across {Object.keys(data).length} acquisition channels
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientsDistribution;
