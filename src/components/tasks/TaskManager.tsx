import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List, LayoutGrid, Calendar } from 'lucide-react';
import { Project } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { TaskListView } from './TaskListView';
import { TaskBoardView } from './TaskBoardView';
import { TaskCalendarView } from './TaskCalendarView';
import { TaskDialog } from './TaskDialog';

interface TaskManagerProps {
  project: Project;
}

export const TaskManager = ({ project }: TaskManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState('list');
  const { tasks, isLoading, createTask, updateTask, deleteTask, addComment, uploadAttachment } = useTasks(project.id);

  const handleCreateTask = async (taskData: any) => {
    const success = await createTask({
      title: taskData.title,
      description: taskData.description,
      status: project.status,
      due_date: project.deadline,
      priority: taskData.priority,
      task_type: taskData.task_type,
      assignees: project.teamMembers || [],
    });

    if (success) {
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Tasks - {project.name}
          </CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <TaskListView 
              tasks={tasks}
              isLoading={isLoading}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddComment={addComment}
              onUploadAttachment={uploadAttachment}
            />
          </TabsContent>

          <TabsContent value="board">
            <TaskBoardView 
              tasks={tasks}
              isLoading={isLoading}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAddComment={addComment}
              onUploadAttachment={uploadAttachment}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <TaskCalendarView 
              tasks={tasks}
              isLoading={isLoading}
              onUpdateTask={updateTask}
            />
          </TabsContent>
        </Tabs>

        <TaskDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateTask}
          title="Create New Task"
        />
      </CardContent>
    </Card>
  );
};