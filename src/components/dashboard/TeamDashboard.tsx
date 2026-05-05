import React from "react";
import { CheckSquare, Clock, Calendar, Briefcase, AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import TeamStatCard from "./TeamStatCard";
import MyTasksTable from "./MyTasksTable";
import DeadlineCard from "./DeadlineCard";
import { useTeamDashboard } from "@/hooks/useTeamDashboard";

const shellCardClass =
  "rounded-[12px] border border-border-soft bg-card p-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]";

const TeamDashboard: React.FC = () => {
  const { stats, myTasks, myProjects, teamMembers, overdueTasks, isLoading } = useTeamDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <main className="bg-card px-6 py-6">
        <div className="flex min-h-[360px] items-center justify-center rounded-[12px] border border-border-soft bg-card">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-card px-6 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[24px] font-semibold leading-8 text-foreground">
            Dashboard Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        {stats.overdueTasks > 0 && (
          <section className={`${shellCardClass} border-red-200 bg-red-50/70 dark:border-red-900/50 dark:bg-red-950/20`}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-red-200 bg-card text-red-600 dark:border-red-900/50 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="text-[14px] font-semibold leading-[120%] text-red-900 dark:text-red-200">
                You have {stats.overdueTasks} overdue task{stats.overdueTasks > 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-[8px] border border-red-100 bg-card px-3 py-3 dark:border-red-900/50"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[14px] font-medium leading-5 text-red-900 dark:text-red-200">
                      {task.title}
                    </h4>
                    <p className="mt-1 text-xs font-medium leading-3 text-red-700 dark:text-red-300">
                      Due: {task.due_date ? format(task.due_date, "MMM dd, yyyy") : "No due date"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/tasks?taskId=${task.id}${task.project_id ? `&projectId=${task.project_id}` : ""}`)}
                    className="h-8 shrink-0 gap-1 rounded-[7px] border-red-200 px-2 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    <ArrowRight className="h-4 w-4" />
                    View Task
                  </Button>
                </div>
              ))}

              {stats.overdueTasks > 3 && (
                <div className="pt-1 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/tasks")}
                    className="h-8 rounded-[7px] px-3 text-xs font-medium text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    View all {stats.overdueTasks} overdue tasks
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        <DeadlineCard
          projects={myProjects}
          tasks={myTasks}
          teamMembers={teamMembers}
          getClientById={() => "Team Project"}
        />

        <MyTasksTable tasks={myTasks} />
      </div>
    </main>
  );
};

export default TeamDashboard;
