export type TaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type TaskType = 'Primary' | 'Secondary' | 'Tertiary';
export type TaskStatus = 'Planning' | 'In progress' | 'Completed' | 'Paused' | 'Cancelled';

export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: Date;
  priority: TaskPriority;
  task_type: TaskType;
  assignees: string[];
  parent_task_id?: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: Date;
}

export interface TaskWithRelations extends Task {
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  subtasks?: Task[];
}