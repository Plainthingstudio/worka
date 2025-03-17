
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gauge, TrendingUp, ChartBar } from "lucide-react";
import { Client, Project } from "@/types";

interface StatisticsSummaryCardsProps {
  clients: Client[];
  projects: Project[];
}

const StatisticsSummaryCards: React.FC<StatisticsSummaryCardsProps> = ({ clients, projects }) => {
  const totalEarnings = projects.reduce((sum, project) => {
    const projectPayments = project.payments ? project.payments.reduce((psum, payment) => {
      return psum + payment.amount;
    }, 0) : 0;
    
    const amountInUSD = project.currency === 'IDR' ? projectPayments / 15000 : projectPayments;
    return sum + amountInUSD;
  }, 0);
  
  const averagePayment = projects.length > 0 ? totalEarnings / projects.length : 0;
  
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clients.length}</div>
          <p className="text-xs text-muted-foreground">
            Real clients from database
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${averagePayment.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Per project average
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Based on {projects.reduce((count, p) => count + (p.payments?.length || 0), 0)} payments
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projects Completed</CardTitle>
          <ChartBar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedProjects}</div>
          <p className="text-xs text-muted-foreground">
            {projects.length > 0 ?
              `${((completedProjects / projects.length) * 100).toFixed(0)}% completion rate` :
              "No projects available"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsSummaryCards;
