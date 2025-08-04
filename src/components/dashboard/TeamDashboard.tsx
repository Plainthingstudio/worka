import React from "react";
import { CheckSquare, Clock, Calendar, Briefcase, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import TeamStatCard from "./TeamStatCard";
import MyTasksTable from "./MyTasksTable";
import DeadlineCard from "./DeadlineCard";
import { useTeamDashboard } from "@/hooks/useTeamDashboard";
import { TaskWithRelations } from "@/types/task";

const TeamDashboard: React.FC = () => {
  const { stats, myTasks, myProjects, overdueTasks, isLoading } = useTeamDashboard();
  const navigate = useNavigate();

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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-900">
              You have {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {overdueTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center justify-between bg-white border border-red-100 rounded-md p-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-red-900 truncate">{task.title}</h4>
                  <p className="text-sm text-red-700">
                    Due: {task.due_date ? format(task.due_date, "MMM dd, yyyy") : "No due date"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tasks?taskId=${task.id}${task.project_id ? `&projectId=${task.project_id}` : ''}`)}
                  className="ml-3 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <ArrowRight className="h-4 w-4 mr-1" />
                  View Task
                </Button>
              </div>
            ))}
            {stats.overdueTasks > 3 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/tasks')}
                  className="text-red-700 hover:bg-red-100"
                >
                  View all {stats.overdueTasks} overdue tasks
                </Button>
              </div>
            )}
          </div>
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