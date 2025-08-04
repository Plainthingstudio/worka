-- Add updated_at column to task_activities table
ALTER TABLE public.task_activities 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();