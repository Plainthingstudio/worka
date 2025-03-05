
// Define default chart colors that match our theme
export const chartColors = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--primary) / 0.8)",
  tertiary: "hsl(var(--primary) / 0.6)",
  quaternary: "hsl(var(--primary) / 0.4)",
  muted: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  background: "hsl(var(--background))",
  border: "hsl(var(--border))",
  foreground: "hsl(var(--foreground))",
};

// Create theme HSL variables for charts
export const chartHslColors = {
  chart1: "var(--primary)",
  chart2: "var(--primary) / 0.8",
  chart3: "var(--primary) / 0.6",
  chart4: "var(--primary) / 0.4",
  chart5: "var(--primary) / 0.2",
};

// Base chart styles for consistent appearance
export const baseChartStyles = {
  background: "transparent",
  color: chartColors.primary,
  fontFamily: "inherit",
  height: 320,
};

// Color array for pie/donut charts
export const CHART_COLORS = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
  "hsl(var(--primary) / 0.2)",
];

// Standard chart config for different data series
export const createChartConfig = (keys: string[]) => {
  const config: Record<string, any> = {};
  
  keys.forEach((key, index) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: `hsl(var(--chart-${index + 1}, ${chartHslColors.chart1}))`,
    };
  });
  
  return config;
};
