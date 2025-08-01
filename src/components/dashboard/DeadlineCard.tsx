
import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectType } from "@/types";
import { TaskWithRelations } from "@/types/task";
import { getProjectTypeBadgeVariant } from "@/components/projects/utils/projectItemUtils";

interface DeadlineCardProps {
  projects: Project[];
  tasks: TaskWithRelations[];
  getClientById: (clientId: string) => string;
}

const DeadlineCard: React.FC<DeadlineCardProps> = ({ projects, tasks, getClientById }) => {
  // Get current date
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  // Filter projects with deadlines in next 3 days
  const upcomingProjectDeadlines = projects.filter(project => {
    const deadline = new Date(project.deadline);
    return deadline >= now && deadline <= threeDaysFromNow;
  }).map(project => ({
    ...project,
    type: 'project' as const,
    deadline: new Date(project.deadline)
  }));

  // Filter tasks with due dates in next 3 days
  const upcomingTaskDeadlines = tasks.filter(task => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate >= now && dueDate <= threeDaysFromNow;
  }).map(task => ({
    ...task,
    type: 'task' as const,
    deadline: new Date(task.due_date!)
  }));

  // Combine and sort all deadlines
  const upcomingDeadlines = [...upcomingProjectDeadlines, ...upcomingTaskDeadlines]
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());


  const getDaysUntilDeadline = (deadline: Date) => {
    const days = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getUrgencyColor = (days: number) => {
    if (days === 0) return "text-red-600";
    if (days === 1) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <Card className="bg-white shadow-sm border border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Upcoming Deadlines
        </CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No urgent deadlines in the next 3 days</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingDeadlines.map((item) => {
              const deadline = item.deadline;
              const daysUntil = getDaysUntilDeadline(deadline);
              
              return (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">
                        {item.type === 'project' ? item.name : item.title}
                      </h4>
                      {item.type === 'project' ? (
                        <Badge variant={getProjectTypeBadgeVariant(item.projectType)}>
                          {item.projectType}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Task
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.type === 'project' 
                        ? `Client: ${getClientById(item.clientId)}`
                        : `Priority: ${item.priority}`
                      }
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {format(deadline, "MMM dd, yyyy")}
                    </p>
                    <p className={`text-xs font-medium ${getUrgencyColor(daysUntil)}`}>
                      {daysUntil === 0 ? "Due Today" : 
                       daysUntil === 1 ? "Due Tomorrow" : 
                       `${daysUntil} days left`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeadlineCard;
