
export const TASK_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
export const TASK_TYPES = ['Primary', 'Secondary', 'Tertiary'] as const;
export const TASK_STATUSES = [
  'Planning',
  'In progress',
  'Awaiting Feedback',
  'Paused',
  'Completed',
  'Cancelled',
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: 'Planning', label: 'Planning' },
  { value: 'In progress', label: 'In Progress' },
  { value: 'Awaiting Feedback', label: 'Awaiting Feedback' },
  { value: 'Paused', label: 'Paused' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const CLOSED_TASK_STATUSES: TaskStatus[] = ['Completed', 'Cancelled'];
export const WORKING_TASK_STATUSES: TaskStatus[] = ['Planning', 'In progress', 'Paused'];

export const isTaskClosedStatus = (status: string): status is TaskStatus =>
  CLOSED_TASK_STATUSES.includes(status as TaskStatus);

export const isTaskWorkingStatus = (status: string): status is TaskStatus =>
  WORKING_TASK_STATUSES.includes(status as TaskStatus);

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
  brief_id?: string;
  brief_type?: string;
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

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: 'comment' | 'status_change' | 'assignee_change' | 'priority_change' | 'attachment' | 'task_created' | 'due_date_change' | 'task_updated' | 'brief_connected' | 'brief_disconnected';
  content?: string;
  metadata: Record<string, any>;
  attachments: any[];
  created_at: Date;
}

export interface TaskWithRelations extends Task {
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  subtasks?: Task[];
  activities?: TaskActivity[];
}
