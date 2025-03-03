
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ListChecks,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import { Client, DashboardStats, Project } from "@/types";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Mock data
import { clients, projects } from "@/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProjects: 0,
    totalEarnings: 0,
    activeProjects: 0,
  });
  
  // Calculate stats from mock data
  useEffect(() => {
    const activeProjects = projects.filter(p => p.status === "In progress").length;
    const totalEarnings = projects.reduce((sum, project) => {
      return sum + project.payments.reduce((total, payment) => total + payment.amount, 0);
    }, 0);

    setStats({
      totalClients: clients.length,
      totalProjects: projects.length,
      totalEarnings,
      activeProjects,
    });
  }, []);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const activeProjects = projects
    .filter(p => p.status === "In progress")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 pl-64">
        <Navbar title="Dashboard" />
        <main className="container mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your studio.
            </p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              icon={Users}
              change={{ value: 12, type: "increase" }}
              className="delay-[0ms]"
            />
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={ListChecks}
              change={{ value: 8, type: "increase" }}
              className="delay-[100ms]"
            />
            <StatCard
              title="Total Earnings"
              value={stats.totalEarnings.toLocaleString()}
              prefix="$"
              icon={DollarSign}
              change={{ value: 14, type: "increase" }}
              className="delay-[200ms]"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={Clock}
              change={{ value: 2, type: "decrease" }}
              className="delay-[300ms]"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-xl border shadow-sm animate-fade-in">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">Recent Clients</h2>
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground"
                  onClick={() => navigate("/clients")}
                >
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Lead Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.leadSource}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="glass-card rounded-xl border shadow-sm animate-fade-in">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">Active Projects</h2>
                <Button
                  variant="ghost"
                  className="text-sm text-muted-foreground"
                  onClick={() => navigate("/projects")}
                >
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProjects.map((project) => {
                      const client = clients.find(c => c.id === project.clientId);
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{client?.name}</TableCell>
                          <TableCell>
                            {format(new Date(project.deadline), "MMM dd, yyyy")}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
