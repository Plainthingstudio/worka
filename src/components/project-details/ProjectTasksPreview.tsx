
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, Plus, CheckCircle2, Clock, Pause, X } from "lucide-react";
import { TaskWithRelations } from "@/types/task";
import { useNavigate } from "react-router-dom";
import { useAssigneeNames } from "@/hooks/useAssigneeNames";
import { format } from "date-fns";
import { getStatusBadgeVariant } from "@/components/projects/utils/projectItemUtils";

interface ProjectTasksPreviewProps {
  projectId: string;
  tasks: TaskWithRelations[];
  isLoading: boolean;
  onCreateTask: () => void;
}

const ProjectTasksPreview: React.FC<ProjectTasksPreviewProps> = ({
  projectId,
  tasks,
  isLoading,
  onCreateTask
}) => {
  const navigate = useNavigate();
  const { getAssigneeNames } = useAssigneeNames();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'In progress':
        return <Clock className="h-4 w-4" />;
      case 'Paused':
        return <Pause className="h-4 w-4" />;
      case 'Cancelled':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleGoToTask = (taskId: string) => {
    navigate(`/tasks?taskId=${taskId}&projectId=${projectId}`);
  };

  const handleViewAllTasks = () => {
    navigate(`/tasks?projectId=${projectId}`);
  };

  // Show only the 5 most recent tasks
  const recentTasks = tasks.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Project Tasks</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateTask}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
            {tasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewAllTasks}
                className="gap-1"
              >
                View All ({tasks.length})
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No tasks created yet</p>
            <Button onClick={onCreateTask} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <Badge variant={getStatusBadgeVariant(task.status as any)}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1">{task.status}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(task.due_date, 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      
                      {task.assignees && task.assignees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{getAssigneeNames(task.assignees).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGoToTask(task.id)}
                    className="shrink-0"
                  >
                    Go to Task
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
            
            {tasks.length > 5 && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewAllTasks}
                  className="text-muted-foreground"
                >
                  View {tasks.length - 5} more tasks
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTasksPreview;
