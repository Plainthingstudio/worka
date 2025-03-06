
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
    const amountInUSD = project.currency === 'IDR' ? project.fee / 15000 : project.fee;
    return sum + amountInUSD;
  }, 0);
  
  const averagePayment = totalEarnings / projects.length;
  
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
            +{Math.floor(Math.random() * 10) + 1}% from previous period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
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
            +{Math.floor(Math.random() * 15) + 5}% from previous period
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
            {((completedProjects / projects.length) * 100).toFixed(0)}% completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsSummaryCards;
