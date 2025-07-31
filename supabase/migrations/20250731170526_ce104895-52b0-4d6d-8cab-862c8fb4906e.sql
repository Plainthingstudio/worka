-- Check if tasks table exists and add missing columns if needed
DO $$ 
BEGIN
    -- Add parent_task_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'parent_task_id'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure RLS is enabled on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing tasks (users can see tasks they created or are assigned to)
DROP POLICY IF EXISTS "Users can view tasks they created or are assigned to" ON public.tasks;
CREATE POLICY "Users can view tasks they created or are assigned to" 
ON public.tasks 
FOR SELECT 
USING (
    auth.uid() = user_id OR 
    auth.uid() = ANY(assignees) OR
    auth.uid() IN (
        SELECT user_id FROM public.team_members
    )
);

-- Create policy for creating tasks
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
CREATE POLICY "Users can create tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for updating tasks
DROP POLICY IF EXISTS "Users can update tasks they created or are assigned to" ON public.tasks;
CREATE POLICY "Users can update tasks they created or are assigned to" 
ON public.tasks 
FOR UPDATE 
USING (
    auth.uid() = user_id OR 
    auth.uid() = ANY(assignees) OR
    auth.uid() IN (
        SELECT user_id FROM public.team_members
    )
);

-- Create policy for deleting tasks
DROP POLICY IF EXISTS "Users can delete tasks they created" ON public.tasks;
CREATE POLICY "Users can delete tasks they created" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);