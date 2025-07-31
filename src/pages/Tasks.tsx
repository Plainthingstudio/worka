import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { ClickUpTaskList } from '@/components/tasks/ClickUpTaskList';
import { TaskListView } from '@/components/tasks/TaskListView';
import { TaskBoardView } from '@/components/tasks/TaskBoardView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { TaskDetailSidebar } from '@/components/tasks/TaskDetailSidebar';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { SubtaskDialog } from '@/components/tasks/SubtaskDialog';
import { supabase } from '@/integrations/supabase/client';
import { TaskWithRelations, TaskStatus, TaskPriority, TaskType } from '@/types/task';
import { Project } from '@/types';
import { Plus, Search, Filter, LayoutList, Users, Calendar, MoreHorizontal, Kanban } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
export const Tasks = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('Planning');
  const [activeView, setActiveView] = useState<'list' | 'board' | 'calendar'>('list');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Handle URL parameters on load
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    const projectId = searchParams.get('projectId');

    // Set project filter if provided
    if (projectId) {
      setSelectedProject(projectId);
    }

    // Auto-select task if provided
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [searchParams, tasks]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      console.log('Session check:', session);
      if (!session) {
        console.log('No session found, redirecting to auth');
        navigate('/auth');
        return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (!session) {
        navigate('/auth');
      } else {
        setIsAuthenticated(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[class*="w-56"], [class*="w-14"]');
      setIsSidebarExpanded(sidebarElement?.classList.contains('w-56') || false);
    };

    // Initial check
    handleSidebarChange();

    // Set up mutation observer to watch for class changes on the sidebar
    const observer = new MutationObserver(handleSidebarChange);
    const sidebarElement = document.querySelector('[class*="flex flex-col border-r"]');
    if (sidebarElement) {
      observer.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    return () => observer.disconnect();
  }, []);
  const fetchProjects = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('projects').select('*').order('created_at', {
        ascending: false
      });
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
        createdAt: new Date(project.created_at)
      }));
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  const fetchAllTasks = async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping task fetch');
      return;
    }
    try {
      setIsLoading(true);
      const {
        data: tasksData,
        error
      } = await supabase.from('tasks').select(`
          *,
          task_comments(*),
          task_attachments(*)
        `).order('created_at', {
        ascending: false
      });
      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to fetch tasks",
          variant: "destructive"
        });
        return;
      }
      console.log('Fetched tasks:', tasksData);
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
          updated_at: new Date(comment.updated_at)
        })) || [],
        attachments: task.task_attachments?.map((attachment: any) => ({
          ...attachment,
          created_at: new Date(attachment.created_at)
        })) || [],
        subtasks: []
      }));
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
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
        status: taskData.status || 'Planning',
        priority: taskData.priority,
        task_type: taskData.task_type,
        assignees: taskData.assignees || [],
        due_date: taskData.due_date,
        project_id: selectedProject === 'all' ? null : selectedProject,
        user_id: (await supabase.auth.getUser()).data.user?.id
      };
      const {
        data,
        error
      } = await supabase.from('tasks').insert([insertData]).select().single();
      if (error) {
        console.error('Error creating task:', error);
        toast({
          title: "Error",
          description: "Failed to create task",
          variant: "destructive"
        });
        return null;
      }
      toast({
        title: "Success",
        description: "Task created successfully"
      });
      await fetchAllTasks();
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
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
      if (updates.due_date !== undefined) processedUpdates.due_date = updates.due_date;
      if (updates.completed_at !== undefined) processedUpdates.completed_at = updates.completed_at;
      const {
        error
      } = await supabase.from('tasks').update(processedUpdates).eq('id', taskId);
      if (error) {
        console.error('Error updating task:', error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive"
        });
        return false;
      }
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
        ...task,
        ...processedUpdates
      } : task));
      toast({
        title: "Success",
        description: "Task updated successfully"
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
      const {
        error
      } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive"
        });
        return false;
      }
      toast({
        title: "Success",
        description: "Task deleted successfully"
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
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return false;
      }
      const {
        data,
        error
      } = await supabase.from('task_comments').insert([{
        task_id: taskId,
        content,
        user_id: user.id
      }]).select('*').single();
      if (error) {
        console.error('Error adding comment:', error);
        return false;
      }
      setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
        ...task,
        comments: [...(task.comments || []), {
          id: data.id,
          content: data.content,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          user_id: data.user_id,
          task_id: data.task_id
        }]
      } : task));
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
      const {
        error: uploadError
      } = await supabase.storage.from('task-attachments').upload(fileName, file);
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return false;
      }
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from('task-attachments').getPublicUrl(fileName);
      const {
        error: dbError
      } = await supabase.from('task_attachments').insert([{
        task_id: taskId,
        user_id: userId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type
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
  const handleAddTask = (status: TaskStatus = 'Planning') => {
    setNewTaskStatus(status);
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubtask = async (subtaskData: any) => {
    try {
      const insertData = {
        title: subtaskData.title || '',
        description: subtaskData.description,
        status: subtaskData.status || 'Planning',
        priority: subtaskData.priority,
        task_type: subtaskData.task_type,
        assignees: subtaskData.assignees || [],
        due_date: subtaskData.due_date,
        parent_task_id: subtaskData.parent_task_id,
        project_id: selectedProject === 'all' ? null : selectedProject,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating subtask:', error);
        toast({
          title: "Error",
          description: "Failed to create subtask",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Subtask created successfully",
      });

      await fetchAllTasks();
      setIsSubtaskDialogOpen(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast({
        title: "Error",
        description: "Failed to create subtask",
        variant: "destructive",
      });
    }
  };

  const handleAddSubtask = (taskId: string) => {
    setParentTaskId(taskId);
    setIsSubtaskDialogOpen(true);
  };
  const filteredTasks = tasks.filter(task => {
    if (selectedProject !== 'all' && task.project_id !== selectedProject) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchAllTasks();
    }
  }, [isAuthenticated]);

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
          <Navbar title="Tasks" />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-lg">Loading...</div>
                <div className="text-sm text-muted-foreground">Verifying authentication</div>
              </div>
            </div>
          </main>
        </div>
      </div>;
  }
  return <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={`flex-1 w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? "ml-56" : "ml-14"}`}>
        <Navbar title="Tasks" />
        <main className="p-6 py-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 sm:py-6 -mx-6 mb-6 py-[8px]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <h1 className="text-xl sm:text-2xl font-semibold">Internal Tasks</h1>
                  <div className="flex items-center gap-0 border rounded-lg p-1">
                    <Button variant={activeView === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 px-2 sm:px-3" onClick={() => setActiveView('list')}>
                      <LayoutList className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">List</span>
                    </Button>
                    <Button variant={activeView === 'board' ? 'default' : 'ghost'} size="sm" className="h-8 px-2 sm:px-3" onClick={() => setActiveView('board')}>
                      <Kanban className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Board</span>
                    </Button>
                    <Button variant={activeView === 'calendar' ? 'default' : 'ghost'} size="sm" className="h-8 px-2 sm:px-3" onClick={() => setActiveView('calendar')}>
                      <Calendar className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Calendar</span>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="sm:flex hidden">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleAddTask()} className="flex-1 sm:flex-none">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Add Task</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="border-b bg-background px-4 sm:px-6 py-4 -mx-6 mb-6">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div className="relative flex-1 max-w-full lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:gap-4">
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
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
                    <SelectTrigger className="w-full sm:w-32">
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
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeView === 'list' && <ClickUpTaskList tasks={filteredTasks} isLoading={isLoading} onTaskClick={task => {
              console.log('Task clicked:', task.title);
              setSelectedTask(task);
            }} onUpdateTask={updateTask} onAddTask={handleAddTask} />}
              
              {activeView === 'board' && <TaskBoardView tasks={filteredTasks} isLoading={isLoading} onUpdateTask={updateTask} onDeleteTask={deleteTask} onAddComment={addComment} onUploadAttachment={uploadAttachment} onAddTask={status => handleAddTask(status)} onTaskClick={task => {
              console.log('Board task clicked:', task.title);
              setSelectedTask(task);
            }} />}
              
              {activeView === 'calendar' && <TaskCalendarView tasks={filteredTasks} isLoading={isLoading} onUpdateTask={updateTask} />}
            </div>
          </div>
        </main>
      </div>

      {/* Task Detail Sidebar */}
      <TaskDetailSidebar 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        onUpdateTask={updateTask} 
        onDeleteTask={deleteTask} 
        onAddComment={addComment} 
        onUploadAttachment={uploadAttachment}
        onAddSubtask={handleAddSubtask}
      />

      {/* Create Task Dialog */}
      <TaskDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSubmit={handleCreateTask} title="Create New Task" />

      {/* Create Subtask Dialog */}
      <SubtaskDialog 
        isOpen={isSubtaskDialogOpen} 
        onClose={() => setIsSubtaskDialogOpen(false)} 
        onSubmit={handleCreateSubtask} 
        parentTaskId={parentTaskId}
        title="Create New Subtask"
      />
    </div>;
};
export default Tasks;