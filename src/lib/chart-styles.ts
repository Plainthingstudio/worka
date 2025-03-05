
// Define default chart colors for consistency across the application
export const CHART_COLORS = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",
  blue: "hsl(217, 91%, 60%)",
  lightBlue: "hsl(213, 94%, 68%)",
  gray: "hsl(220, 13%, 91%)"
};

// For donut charts
export const DONUT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
];
