
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { Activity, Users, FolderOpen, DollarSign } from "lucide-react";
import AssignRoleButton from "@/components/debug/AssignRoleButton";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your business.
          </p>
        </div>
        <div className="flex gap-2">
          <AssignRoleButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value="12"
          icon={Users}
          trend="+2 from last month"
        />
        <StatCard
          title="Active Projects"
          value="8"
          icon={FolderOpen}
          trend="+1 from last week"
        />
        <StatCard
          title="Revenue"
          value="$24,500"
          icon={DollarSign}
          trend="+12% from last month"
        />
        <StatCard
          title="Completion Rate"
          value="94%"
          icon={Activity}
          trend="+2% from last month"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your projects and clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New client added</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Project completed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                <div className="font-medium">Add New Client</div>
                <div className="text-sm text-muted-foreground">Create a new client profile</div>
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                <div className="font-medium">Start New Project</div>
                <div className="text-sm text-muted-foreground">Begin a new project</div>
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-muted transition-colors">
                <div className="font-medium">Generate Invoice</div>
                <div className="text-sm text-muted-foreground">Create an invoice for a client</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
