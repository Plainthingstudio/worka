-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'task_assigned',
  'task_due_reminder',
  'task_overdue',
  'task_status_changed',
  'task_comment_added',
  'project_due_reminder',
  'project_overdue',
  'project_status_changed',
  'project_payment_added'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to create task assignment notifications
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assignee_id UUID;
BEGIN
  -- Only create notifications for new assignments (when assignees array changes)
  IF TG_OP = 'UPDATE' AND OLD.assignees = NEW.assignees THEN
    RETURN NEW;
  END IF;

  -- For each assignee, create a notification
  FOREACH assignee_id IN ARRAY NEW.assignees
  LOOP
    -- Don't notify the task creator
    IF assignee_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        assignee_id,
        'task_assigned',
        'New Task Assignment',
        'You have been assigned to task: ' || NEW.title,
        jsonb_build_object('task_id', NEW.id, 'task_title', NEW.title)
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create task status change notifications
CREATE OR REPLACE FUNCTION notify_task_status_change()
RETURNS TRIGGER AS $$
DECLARE
  assignee_id UUID;
BEGIN
  -- Only notify on status changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Notify task creator and assignees
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.user_id,
    'task_status_changed',
    'Task Status Updated',
    'Task "' || NEW.title || '" status changed to ' || NEW.status,
    jsonb_build_object('task_id', NEW.id, 'task_title', NEW.title, 'new_status', NEW.status)
  );

  -- Notify assignees (except if they're the task creator)
  FOREACH assignee_id IN ARRAY NEW.assignees
  LOOP
    IF assignee_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        assignee_id,
        'task_status_changed',
        'Task Status Updated',
        'Task "' || NEW.title || '" status changed to ' || NEW.status,
        jsonb_build_object('task_id', NEW.id, 'task_title', NEW.title, 'new_status', NEW.status)
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create project deadline reminders
CREATE OR REPLACE FUNCTION notify_project_deadline()
RETURNS TRIGGER AS $$
BEGIN
  -- Create deadline reminder for project owner when deadline is within 7 days
  IF NEW.deadline <= (CURRENT_TIMESTAMP + INTERVAL '7 days') AND 
     NEW.deadline > CURRENT_TIMESTAMP AND 
     NEW.status != 'Completed' THEN
    
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'project_due_reminder',
      'Project Deadline Approaching',
      'Project "' || NEW.name || '" is due on ' || TO_CHAR(NEW.deadline, 'Mon DD, YYYY'),
      jsonb_build_object('project_id', NEW.id, 'project_name', NEW.name, 'deadline', NEW.deadline)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER task_assignment_notification
  AFTER INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_assignment();

CREATE TRIGGER task_status_notification
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_task_status_change();

CREATE TRIGGER project_deadline_notification
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION notify_project_deadline();

-- Add indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL;