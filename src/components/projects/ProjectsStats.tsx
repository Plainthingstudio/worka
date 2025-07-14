
import React from "react";
import { Clock, CalendarIcon, X, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, ProjectStatus } from "@/types";

interface ProjectsStatsProps {
  projects: Project[];
}

const ProjectsStats: React.FC<ProjectsStatsProps> = ({ projects }) => {
  // Count projects by status
  const inProgressCount = projects.filter(p => p.status === "In progress").length;
  const planningCount = projects.filter(p => p.status === "Planning").length;
  const cancelledCount = projects.filter(p => p.status === "Cancelled").length;
  const completedCount = projects.filter(p => p.status === "Completed").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressCount}</div>
          <p className="text-xs text-muted-foreground">
            Projects currently in progress
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">Planning</CardTitle>
          <CalendarIcon className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{planningCount}</div>
          <p className="text-xs text-muted-foreground">
            Projects in planning stage
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          <X className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{cancelledCount}</div>
          <p className="text-xs text-muted-foreground">
            Projects that were cancelled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCount}</div>
          <p className="text-xs text-muted-foreground">
            Successfully completed projects
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsStats;
