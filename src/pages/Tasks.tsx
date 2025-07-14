import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TaskWithRelations, TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { Project } from '@/types';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskBoardView } from '@/components/tasks/TaskBoardView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { Plus, Search, Filter, CheckSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Tasks = () => {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('list');

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      const transformedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        clientId: project.client_id,
        status: project.status as any,
        deadline: new Date(project.deadline),
        fee: project.fee,
        currency: project.currency as any,
        projectType: project.project_type as any,
        categories: project.categories as any,
        payments: [],
        teamMembers: project.team_members || [],
        createdAt: new Date(project.created_at),
      }));

      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_comments(*),
          task_attachments(*),
          subtasks:tasks!tasks_parent_task_id_fkey(*)
        `)
        .is('parent_task_id', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive",
        });
        return;
      }

      const transformedTasks: TaskWithRelations[] = tasksData.map(task => ({
        ...task,
        status: task.status as TaskStatus,
        priority: task.priority as TaskPriority,
        task_type: task.task_type as TaskType,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        comments: task.task_comments?.map((comment: any) => ({
          ...comment,
          created_at: new Date(comment.created_at),
          updated_at: new Date(comment.updated_at),
        })) || [],
        attachments: task.task_attachments?.map((attachment: any) => ({
          ...attachment,
          created_at: new Date(attachment.created_at),
        })) || [],
        subtasks: task.subtasks?.map((subtask: any) => ({
          ...subtask,
          status: subtask.status as TaskStatus,
          priority: subtask.priority as TaskPriority,
          task_type: subtask.task_type as TaskType,
          due_date: subtask.due_date ? new Date(subtask.due_date) : undefined,
          completed_at: subtask.completed_at ? new Date(subtask.completed_at) : undefined,
          created_at: new Date(subtask.created_at),
          updated_at: new Date(subtask.updated_at),
        })) || [],
      }));

      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: any) => {
    try {
      const insertData = {
        title: taskData.title || '',
        description: taskData.description,
        status: 'Planning' as TaskStatus,
        priority: taskData.priority,
        task_type: taskData.task_type,
        assignees: [],
        project_id: selectedProject === 'all' ? projects[0]?.id : selectedProject,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      await fetchAllTasks();
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: any) => {
    try {
      const processedUpdates: any = {};
      
      if (updates.title !== undefined) processedUpdates.title = updates.title;
      if (updates.description !== undefined) processedUpdates.description = updates.description;
      if (updates.status !== undefined) processedUpdates.status = updates.status;
      if (updates.priority !== undefined) processedUpdates.priority = updates.priority;
      if (updates.task_type !== undefined) processedUpdates.task_type = updates.task_type;
      if (updates.assignees !== undefined) processedUpdates.assignees = updates.assignees;
      if (updates.due_date !== undefined) processedUpdates.due_date = updates.due_date?.toISOString();
      if (updates.completed_at !== undefined) processedUpdates.completed_at = updates.completed_at?.toISOString();

      const { error } = await supabase
        .from('tasks')
        .update(processedUpdates)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      await fetchAllTasks();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      });

      await fetchAllTasks();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('task_comments')
        .insert([{
          task_id: taskId,
          content,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        }]);

      if (error) {
        console.error('Error adding comment:', error);
        return false;
      }

      await fetchAllTasks();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const uploadAttachment = async (taskId: string, file: File) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return false;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('task-attachments')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('task_attachments')
        .insert([{
          task_id: taskId,
          user_id: userId,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
        }]);

      if (dbError) {
        console.error('Error saving attachment record:', dbError);
        return false;
      }

      await fetchAllTasks();
      return true;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return false;
    }
  };

  const handleCreateTask = async (taskData: any) => {
    const success = await createTask(taskData);
    if (success) {
      setIsCreateDialogOpen(false);
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    if (selectedProject !== 'all' && task.project_id !== selectedProject) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  useEffect(() => {
    fetchProjects();
    fetchAllTasks();
  }, []);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In progress">In Progress</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{filteredTasks.length}</p>
              </div>
              <Badge variant="secondary">{filteredTasks.length}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{filteredTasks.filter(t => t.status === 'In progress').length}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-500 text-white">Active</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{filteredTasks.filter(t => t.status === 'Completed').length}</p>
              </div>
              <Badge variant="secondary" className="bg-green-500 text-white">Done</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">{filteredTasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length}</p>
              </div>
              <Badge variant="secondary" className="bg-orange-500 text-white">Priority</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Views */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="board">Board View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <TaskListView 
                tasks={filteredTasks}
                isLoading={isLoading}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddComment={addComment}
                onUploadAttachment={uploadAttachment}
              />
            </TabsContent>

            <TabsContent value="board" className="mt-6">
              <TaskBoardView 
                tasks={filteredTasks}
                isLoading={isLoading}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddComment={addComment}
                onUploadAttachment={uploadAttachment}
              />
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <TaskCalendarView 
                tasks={filteredTasks}
                isLoading={isLoading}
                onUpdateTask={updateTask}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TaskDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
        title="Create New Task"
      />
    </div>
  );
};

export default Tasks;