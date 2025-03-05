
// Define default chart colors that match our theme
export const chartColors = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--primary) / 0.8)",
  tertiary: "hsl(var(--primary) / 0.6)",
  quaternary: "hsl(var(--primary) / 0.4)",
  quinary: "hsl(var(--primary) / 0.2)",
  muted: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  background: "hsl(var(--background))",
  border: "hsl(var(--border))",
  foreground: "hsl(var(--foreground))",
};

// Chart config for different data series
export const createChartConfig = (keys: string[]) => {
  const config: Record<string, any> = {};
  
  keys.forEach((key, index) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });
  
  return config;
};

// Color array for pie/donut charts
export const DONUT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];
