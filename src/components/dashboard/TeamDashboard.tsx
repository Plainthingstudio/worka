import React from "react";
import { CheckSquare, Clock, Calendar, Briefcase, AlertTriangle } from "lucide-react";
import TeamStatCard from "./TeamStatCard";
import MyTasksTable from "./MyTasksTable";
import DeadlineCard from "./DeadlineCard";
import { useTeamDashboard } from "@/hooks/useTeamDashboard";
import { TaskWithRelations } from "@/types/task";

const TeamDashboard: React.FC = () => {
  const { stats, myTasks, myProjects, isLoading } = useTeamDashboard();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Team Member Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TeamStatCard
          title="My Active Tasks"
          value={stats.myActiveTasks}
          icon={CheckSquare}
          description="Tasks in progress"
        />
        <TeamStatCard
          title="Completed This Week"
          value={stats.completedThisWeek}
          icon={Calendar}
          description="Tasks finished"
        />
        <TeamStatCard
          title="Due This Week"
          value={stats.dueThisWeek}
          icon={Clock}
          description="Upcoming deadlines"
        />
        <TeamStatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={Briefcase}
          description="Projects involved in"
        />
      </div>

      {/* Overdue Alert */}
      {stats.overdueTasks > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">
              You have {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Please review your tasks and update their status or due dates.
          </p>
        </div>
      )}

      {/* My Deadlines */}
      <DeadlineCard 
        projects={myProjects} 
        tasks={myTasks}
        getClientById={() => "Team Project"}
      />

      {/* My Active Tasks */}
      <MyTasksTable tasks={myTasks} />
    </div>
  );
};

export default TeamDashboard;