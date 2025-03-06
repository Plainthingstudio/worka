
import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { projects } from "@/mockData";
import { DateRange, Payment } from "@/types";
import { format, subMonths, isWithinInterval } from "date-fns";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/chart-styles";

interface EarningsSummaryProps {
  dateRange: DateRange;
}

const EarningsSummary: React.FC<EarningsSummaryProps> = ({
  dateRange
}) => {
  const getMonthlyData = () => {
    const endDate = new Date();
    const startDate = subMonths(endDate, 5); // Last 6 months (current + 5 previous)
    
    console.log("Earnings date range:", { startDate, endDate });

    // Initialize monthly counts
    const months: string[] = [];
    const monthlyEarnings: {
      [key: string]: number;
    } = {};

    // Initialize past 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const monthKey = format(date, "MMM");
      months.push(monthKey);
      monthlyEarnings[monthKey] = 0;
    }

    // Extract all payments from all projects
    const allPayments: Payment[] = [];
    projects.forEach(project => {
      project.payments.forEach(payment => {
        allPayments.push({
          ...payment,
          currency: project.currency // Add the project currency to the payment
        });
      });
    });
    
    console.log("All payments:", allPayments);

    // Sum earnings by payment date
    allPayments.forEach(payment => {
      const paymentDate = new Date(payment.date);
      if (isWithinInterval(paymentDate, { start: startDate, end: endDate })) {
        const monthKey = format(paymentDate, "MMM");
        if (monthlyEarnings[monthKey] !== undefined) {
          // Convert to USD if needed
          const amountInUSD = payment.currency === 'IDR' ? payment.amount / 15000 : payment.amount;
          monthlyEarnings[monthKey] += amountInUSD;
        }
      }
    });
    
    console.log("Monthly earnings data:", monthlyEarnings);

    // Create data array
    return months.map(month => ({
      month,
      earnings: Math.round(monthlyEarnings[month])
    }));
  };
  
  const data = getMonthlyData();
  console.log("Earnings chart data:", data);
  
  const totalEarnings = data.reduce((sum, item) => sum + item.earnings, 0);
  const startMonth = format(subMonths(new Date(), 5), "MMMM");
  const endMonth = format(new Date(), "MMMM yyyy");
  const dateRangeText = `${startMonth} - ${endMonth}`;
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Earnings Over Time</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-0 py-0">
        <div className="h-[280px] w-full px-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 0
              }} 
              barSize={28}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={CHART_COLORS.gray} opacity={0.3} />
              <XAxis 
                dataKey="month" 
                tickLine={false} 
                axisLine={false} 
                tick={{
                  fill: '#6B7280',
                  fontSize: 12
                }} 
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
                tick={{
                  fill: '#6B7280',
                  fontSize: 12
                }} 
                dx={-5} 
                tickFormatter={value => `$${value.toLocaleString()}`} 
                width={60} 
              />
              <Tooltip 
                cursor={{
                  fill: 'rgba(200, 200, 200, 0.1)'
                }} 
                content={({
                  active,
                  payload
                }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-card p-2 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">{data.month}</span>
                          <span className="text-sm font-bold">
                            ${data.earnings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              <Bar 
                dataKey="earnings" 
                radius={[4, 4, 0, 0]} 
                fill={CHART_COLORS.primary} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm pt-4 pb-4 px-6 mt-auto">
        <div className="flex items-center gap-2 font-medium leading-none">
          ${totalEarnings.toLocaleString()} earned in the last 6 months
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          Based on payment dates when clients paid
        </div>
      </CardFooter>
    </Card>
  );
};

export default EarningsSummary;
