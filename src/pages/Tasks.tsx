import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ClickUpTaskList } from '@/components/tasks/ClickUpTaskList';
import { TaskBoardView } from '@/components/tasks/TaskBoardView';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { TaskDetailSidebar } from '@/components/tasks/TaskDetailSidebar';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { SubtaskDialog } from '@/components/tasks/SubtaskDialog';
import { account, databases, DATABASE_ID, ID, Query, storage } from '@/integrations/appwrite/client';
import { TaskWithRelations, TaskStatus, TASK_STATUS_OPTIONS } from '@/types/task';
import { useTasksData } from '@/hooks/useTasksData';
import { Plus, Search, Filter, LayoutList, Calendar, Kanban } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const Tasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tasks, projects, isLoading, invalidate, setQueryData } = useTasksData();
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
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [myTaskIdentityIds, setMyTaskIdentityIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMyTaskIdentities = async () => {
      try {
        const user = await account.get();
        if (!isMounted) return;

        setCurrentUserId(user.$id);

        const teamResponse = await databases.listDocuments(DATABASE_ID, 'team_members', [
          Query.equal('user_id', user.$id),
        ]);
        const memberIds = teamResponse.documents.map((member: any) => member.$id);

        if (isMounted) {
          setMyTaskIdentityIds(Array.from(new Set([user.$id, ...memberIds].filter(Boolean))));
        }
      } catch {
        if (isMounted) {
          setCurrentUserId(null);
          setMyTaskIdentityIds([]);
        }
      }
    };

    fetchMyTaskIdentities();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle URL parameters on load
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    const projectId = searchParams.get('projectId');
    const newParam = searchParams.get('new');

    // Set project filter if provided
    if (projectId) {
      setSelectedProject(projectId);
    }

    // Auto-open create dialog if new=true parameter is present
    if (newParam === 'true' && !isLoading) {
      setIsCreateDialogOpen(true);
      // Remove the query parameter from URL
      setSearchParams({});
    }

    // Auto-select task if provided
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [searchParams, tasks, isLoading, setSearchParams]);

  const createTask = async (taskData: any) => {
    try {
      let user;
      try {
        user = await account.get();
      } catch {
        user = null;
      }

      const resolvedProjectId =
        taskData.project_id || (selectedProject === 'all' ? null : selectedProject);

      if (!resolvedProjectId) {
        toast({
          title: "Project required",
          description: "Please select a project before creating a task.",
          variant: "destructive"
        });
        return null;
      }

      const insertData = {
        title: taskData.title || '',
        description: taskData.description,
        status: taskData.status || 'Planning',
        priority: taskData.priority,
        task_type: taskData.task_type,
        assignees: taskData.assignees || [],
        due_date: taskData.due_date,
        project_id: resolvedProjectId,
        user_id: user?.$id
      };

      const data = await databases.createDocument(DATABASE_ID, 'tasks', ID.unique(), insertData);

      toast({
        title: "Success",
        description: "Task created successfully"
      });
      invalidate();
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

      setQueryData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === taskId ? { ...task, ...processedUpdates } : task
          ),
        };
      });

      await databases.updateDocument(DATABASE_ID, 'tasks', taskId, processedUpdates);

      toast({
        title: "Success",
        description: "Task updated successfully"
      });
      invalidate();
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, 'tasks', taskId);

      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
      invalidate();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
      return false;
    }
  };

  const addComment = async (taskId: string, content: string) => {
    try {
      let user;
      try {
        user = await account.get();
      } catch {
        console.error('No authenticated user found');
        return false;
      }

      if (!user) {
        console.error('No authenticated user found');
        return false;
      }

      const data = await databases.createDocument(DATABASE_ID, 'task_comments', ID.unique(), {
        task_id: taskId,
        content,
        user_id: user.$id
      });

      setQueryData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  comments: [...(task.comments || []), {
                    id: data.$id,
                    content: data.content,
                    created_at: new Date(data.$createdAt),
                    updated_at: new Date(data.$updatedAt),
                    user_id: data.user_id,
                    task_id: data.task_id,
                  }],
                }
              : task
          ),
        };
      });
      invalidate();
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  const uploadAttachment = async (taskId: string, file: File) => {
    try {
      let userId: string | undefined;
      try {
        const user = await account.get();
        userId = user.$id;
      } catch {
        userId = undefined;
      }

      // Upload file to Appwrite storage
      const uploadedFile = await storage.createFile('task-attachments', ID.unique(), file);
      const fileUrl = storage.getFileView('task-attachments', uploadedFile.$id).toString();

      await databases.createDocument(DATABASE_ID, 'task_attachments', ID.unique(), {
        task_id: taskId,
        user_id: userId,
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        file_type: file.type
      });

      invalidate();
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

  const findTaskById = (taskId: string): TaskWithRelations | undefined => {
    for (const task of tasks) {
      if (task.id === taskId) return task;

      const subtask = task.subtasks?.find((item) => item.id === taskId);
      if (subtask) return subtask as TaskWithRelations;
    }

    return undefined;
  };

  useEffect(() => {
    if (!selectedTask) return;

    const refreshedTask = findTaskById(selectedTask.id);

    if (!refreshedTask) {
      setSelectedTask(null);
      return;
    }

    if (refreshedTask !== selectedTask) {
      setSelectedTask(refreshedTask);
    }
  }, [tasks, selectedTask?.id]);

  const handleCreateSubtask = async (subtaskData: any) => {
    try {
      let user;
      try {
        user = await account.get();
      } catch {
        toast({
          title: "Error",
          description: "You must be logged in to create subtasks",
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create subtasks",
          variant: "destructive"
        });
        return;
      }

      const resolvedParentTaskId = subtaskData.parent_task_id || parentTaskId;
      const parentTask = findTaskById(resolvedParentTaskId);
      const parentProjectId = parentTask?.project_id || (selectedProject !== 'all' ? selectedProject : null);

      if (!parentProjectId) {
        toast({
          title: "Error",
          description: "Could not find the parent task project for this subtask",
          variant: "destructive"
        });
        return;
      }

      const insertData = {
        title: subtaskData.title || '',
        description: subtaskData.description,
        status: subtaskData.status || 'Planning',
        priority: subtaskData.priority,
        task_type: subtaskData.task_type,
        assignees: subtaskData.assignees || [],
        due_date: subtaskData.due_date?.toISOString?.() || subtaskData.due_date,
        parent_task_id: resolvedParentTaskId,
        project_id: parentProjectId,
        user_id: user.$id
      };

      console.log('Creating subtask with data:', insertData);

      const data = await databases.createDocument(DATABASE_ID, 'tasks', ID.unique(), insertData);

      console.log('Subtask created successfully:', data);
      toast({
        title: "Success",
        description: "Subtask created successfully"
      });
      invalidate();
      setIsSubtaskDialogOpen(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subtask",
        variant: "destructive"
      });
    }
  };

  const handleAddSubtask = (taskId: string) => {
    setParentTaskId(taskId);
    setIsSubtaskDialogOpen(true);
  };

  const isAssignedToCurrentUser = (task: TaskWithRelations) => {
    const assignees = task.assignees || [];

    return Boolean(
      (currentUserId && task.user_id === currentUserId) ||
        myTaskIdentityIds.some((id) => assignees.includes(id))
    );
  };

  const matchesTaskFilters = (task: TaskWithRelations) => {
    if (selectedProject !== 'all' && task.project_id !== selectedProject) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  };

  const filteredTasks = tasks.reduce<TaskWithRelations[]>((acc, task) => {
    const taskMatchesFilters = matchesTaskFilters(task);
    const subtasks = (task.subtasks || []) as TaskWithRelations[];
    const filteredSubtasks = subtasks.filter((subtask) => {
      if (!matchesTaskFilters(subtask)) return false;
      return !myTasksOnly || isAssignedToCurrentUser(subtask);
    });

    if (!myTasksOnly) {
      if (taskMatchesFilters) {
        acc.push({ ...task, subtasks: filteredSubtasks });
      }
      return acc;
    }

    if ((taskMatchesFilters && isAssignedToCurrentUser(task)) || filteredSubtasks.length > 0) {
      acc.push({ ...task, subtasks: filteredSubtasks });
    }

    return acc;
  }, []);

  // Listen for subtask detail opening events
  useEffect(() => {
    const handleOpenTaskDetails = (event: CustomEvent) => {
      const subtask = event.detail;
      if (subtask) {
        setSelectedTask(subtask);
      }
    };
    window.addEventListener('openTaskDetails', handleOpenTaskDetails as EventListener);
    return () => {
      window.removeEventListener('openTaskDetails', handleOpenTaskDetails as EventListener);
    };
  }, []);

  const viewTabs: { key: 'board' | 'list' | 'calendar'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'board', label: 'Board', icon: Kanban },
    { key: 'list', label: 'List', icon: LayoutList },
    { key: 'calendar', label: 'Timeline', icon: Calendar },
  ];

  return <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Header row — title + Add Task */}
        <div className="flex items-start justify-between">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h1 className="text-foreground" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 24, lineHeight: '32px', letterSpacing: '-0.03em' }}>
              Tasks
            </h1>
            <p className="text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 16, lineHeight: '24px' }}>
              List of task for all team members
            </p>
          </div>
          <button
            onClick={() => handleAddTask()}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90 bg-brand text-brand-foreground"
            style={{
              gap: 8,
              padding: '8px 12px',
              height: 38,
              backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
              boxShadow: '0px 1px 2px rgba(14,18,27,0.239216), 0px 0px 0px 1px hsl(var(--brand))',
              borderRadius: 7,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              lineHeight: '20px',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} strokeWidth={1.67} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Tabs + search/filter row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex items-center bg-surface-2 dark:bg-[hsl(222_33%_7%)]"
              style={{ padding: 4, gap: 0, borderRadius: 8 }}
            >
              {viewTabs.map(({ key, label, icon: Icon }) => {
                const active = activeView === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveView(key)}
                    className={cn(
                      "inline-flex items-center text-[14px] font-medium leading-5 transition-all",
                      active
                        ? "bg-card text-foreground shadow-[0px_1px_2px_rgba(15,23,42,0.08)] dark:bg-[hsl(225_31%_11%)] dark:shadow-[0px_1px_3px_rgba(0,0,0,0.5)]"
                        : "bg-transparent text-muted-foreground"
                    )}
                    style={{
                      gap: 4,
                      padding: '4px 12px',
                      height: 32,
                      borderRadius: active ? 8 : 10,
                      fontFamily: 'Inter, sans-serif',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <label
              className="inline-flex items-center border border-border-soft bg-card text-foreground"
              style={{
                gap: 8,
                height: 36,
                padding: '0 12px',
                borderRadius: 12,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
              }}
            >
              <Switch
                checked={myTasksOnly}
                onCheckedChange={setMyTasksOnly}
                className="h-5 w-9 data-[state=checked]:bg-brand [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"
              />
              <span>My task</span>
            </label>
          </div>

          <div className="flex items-center" style={{ gap: 12 }}>
            <div className="relative" style={{ width: 208, height: 36 }}>
              <Search
                className="text-muted-foreground"
                style={{ position: 'absolute', left: 12, top: 10, width: 16, height: 16 }}
                strokeWidth={1.67}
              />
              <Input
                placeholder="Search task..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-surface-2 border-border-soft text-foreground"
                style={{
                  width: 208,
                  height: 36,
                  paddingLeft: 40,
                  paddingRight: 12,
                  borderRadius: 12,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                }}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center justify-center transition-colors hover:bg-surface-hover bg-surface-2 border border-border-soft text-foreground"
                  style={{
                    gap: 8,
                    height: 36,
                    padding: '0 12px',
                    borderRadius: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                  }}
                >
                  <Filter style={{ width: 16, height: 16 }} strokeWidth={1.67} />
                  <span>Filter</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {TASK_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full">
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeView === 'list' && <ClickUpTaskList tasks={filteredTasks} projects={projects} isLoading={isLoading} onTaskClick={task => {
      setSelectedTask(task);
    }} onUpdateTask={updateTask} onAddTask={handleAddTask} />}

          {activeView === 'board' && <TaskBoardView tasks={filteredTasks} isLoading={isLoading} onUpdateTask={updateTask} onDeleteTask={deleteTask} onAddComment={addComment} onUploadAttachment={uploadAttachment} onAddTask={status => handleAddTask(status)} onTaskClick={task => {
      setSelectedTask(task);
    }} />}

          {activeView === 'calendar' && <TaskCalendarView tasks={filteredTasks} isLoading={isLoading} onUpdateTask={updateTask} />}
        </div>
      {/* Task Detail Sidebar */}
      <TaskDetailSidebar task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} onUpdateTask={updateTask} onDeleteTask={deleteTask} onAddComment={addComment} onUploadAttachment={uploadAttachment} onAddSubtask={handleAddSubtask} onTaskSelect={setSelectedTask} allTasks={tasks} />

      {/* Create Task Dialog */}
      <TaskDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTask}
        title="Create New Task"
        projects={projects.map((project) => ({ id: project.id, name: project.name }))}
        requireProjectSelection={selectedProject === 'all'}
        initialData={selectedProject !== 'all' ? { project_id: selectedProject } : undefined}
      />

      {/* Create Subtask Dialog */}
      <SubtaskDialog isOpen={isSubtaskDialogOpen} onClose={() => setIsSubtaskDialogOpen(false)} onSubmit={handleCreateSubtask} parentTaskId={parentTaskId} title="Create New Subtask" />
    </div>;
};

export default Tasks;
