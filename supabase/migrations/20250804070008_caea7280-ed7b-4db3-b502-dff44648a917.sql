-- Add updated_at column to task_activities table
ALTER TABLE public.task_activities 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_task_activities_updated_at
BEFORE UPDATE ON public.task_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();