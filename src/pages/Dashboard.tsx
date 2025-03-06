
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Users, Briefcase, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { Client, Project, ProjectType } from "@/types";

// Import mock data
import { clients, projects } from "@/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProjects: 0,
    totalEarnings: 0,
    activeProjects: 0,
  });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
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

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const activeProjects = projects
    .filter(p => p.status === "In progress")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const getProjectTypeBadgeClass = (type: ProjectType) => {
    switch (type) {
      case "Project Based":
        return "bg-blue-50 text-blue-700 ring-blue-700/10";
      case "Monthly Retainer":
        return "bg-purple-50 text-purple-700 ring-purple-700/10";
      case "Monthly Pay as you go":
        return "bg-yellow-50 text-yellow-800 ring-yellow-600/20";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-500/10";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? "ml-56" : "ml-14"
        }`}
      >
        <Navbar title="Dashboard" />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard Overview
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Clients"
              value={stats.totalClients}
              icon={Users}
              className="bg-white shadow-sm border border-border"
            />
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={Briefcase}
              className="bg-white shadow-sm border border-border"
            />
            <StatCard
              title="Total Earnings"
              value={stats.totalEarnings.toLocaleString()}
              prefix="$"
              icon={DollarSign}
              className="bg-white shadow-sm border border-border"
            />
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={Activity}
              className="bg-white shadow-sm border border-border"
            />
          </div>

          {/* Recent Clients */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recent Clients</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground"
                onClick={() => navigate("/clients")}
              >
                Go to Clients
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-white rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Lead Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentClients.length > 0 ? (
                    recentClients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone}</TableCell>
                        <TableCell>{client.leadSource}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        No clients found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Active Projects</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground"
                onClick={() => navigate("/projects")}
              >
                Go to Projects
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="bg-white rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeProjects.length > 0 ? (
                    activeProjects.map((project) => {
                      const client = clients.find(c => c.id === project.clientId);
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{client?.name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-yellow-600/20 ring-inset">
                              {project.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {format(new Date(project.deadline), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            <Badge className={`flex items-center gap-1 ${getProjectTypeBadgeClass(project.projectType)}`}>
                              <span>{project.projectType}</span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No active projects found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
