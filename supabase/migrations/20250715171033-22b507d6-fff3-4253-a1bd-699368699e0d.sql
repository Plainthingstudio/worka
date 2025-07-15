
-- Create task_activities table for unified activity tracking
CREATE TABLE public.task_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('comment', 'status_change', 'assignee_change', 'priority_change', 'attachment', 'task_created', 'due_date_change', 'task_updated')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing task activities
CREATE POLICY "Users can view task activities" 
  ON public.task_activities 
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    (EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_activities.task_id 
      AND (
        (t.project_id IS NULL AND t.user_id = auth.uid()) OR
        (t.project_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM projects p 
          WHERE p.id = t.project_id AND p.user_id = auth.uid()
        ))
      )
    ))
  );

-- Create policy for creating task activities
CREATE POLICY "Users can create task activities" 
  ON public.task_activities 
  FOR INSERT 
  WITH CHECK (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'administrator'::app_role) OR 
    (EXISTS (
      SELECT 1 FROM tasks t 
      WHERE t.id = task_activities.task_id 
      AND (
        (t.project_id IS NULL AND t.user_id = auth.uid()) OR
        (t.project_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM projects p 
          WHERE p.id = t.project_id AND p.user_id = auth.uid()
        ))
      )
    ))
  );

-- Create policy for updating own activities
CREATE POLICY "Users can update their own activities" 
  ON public.task_activities 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy for deleting own activities
CREATE POLICY "Users can delete their own activities" 
  ON public.task_activities 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_task_activities_task_id ON public.task_activities(task_id);
CREATE INDEX idx_task_activities_created_at ON public.task_activities(created_at DESC);

-- Create trigger to update updated_at column
CREATE TRIGGER update_task_activities_updated_at
  BEFORE UPDATE ON public.task_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
