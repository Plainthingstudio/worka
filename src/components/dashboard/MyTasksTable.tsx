import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
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
import { TaskWithRelations } from "@/types/task";
import { getStatusBadgeClass } from "@/utils/statusColors";

interface MyTasksTableProps {
  tasks: TaskWithRelations[];
  title?: string;
  showAll?: boolean;
}

const MyTasksTable: React.FC<MyTasksTableProps> = ({ 
  tasks, 
  title = "My Active Tasks",
  showAll = false 
}) => {
  const navigate = useNavigate();
  
  const activeTasks = tasks
    .filter(task => task.status !== 'Completed' && task.status !== 'Cancelled')
    .sort((a, b) => {
      // Sort by due date (tasks with due dates first)
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      if (a.due_date && b.due_date) {
        return a.due_date.getTime() - b.due_date.getTime();
      }
      return b.created_at.getTime() - a.created_at.getTime();
    })
    .slice(0, showAll ? undefined : 5);


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-400/30';
      case 'Normal':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/30';
      case 'Low':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-400/30';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-400/30';
    }
  };

  const isOverdue = (dueDate: Date | undefined) => {
    if (!dueDate) return false;
    return dueDate < new Date();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate("/tasks")}>
          View All Tasks
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <div className="glass-card rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No active tasks found. You're all caught up!
                </TableCell>
              </TableRow>
            ) : (
              activeTasks.map((task) => (
                <TableRow key={task.id} className="cursor-pointer hover:bg-accent/50">
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeClass(task.status)} text-xs`}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-xs ${
                          isOverdue(task.due_date) ? 'text-red-600 font-medium dark:text-red-400' : 'text-muted-foreground'
                        }`}>
                          {format(task.due_date, "MMM dd")}
                          {isOverdue(task.due_date) && " (Overdue)"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No due date</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MyTasksTable;