-- First, drop the existing foreign key constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_project_id_fkey' 
        AND table_name = 'tasks'
    ) THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_project_id_fkey;
    END IF;
END $$;

-- Update the tasks table to allow project_id to be nullable
-- so tasks can exist without a project
ALTER TABLE tasks 
ALTER COLUMN project_id DROP NOT NULL;

-- Add the foreign key constraint with SET NULL behavior
ALTER TABLE tasks 
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES projects(id) 
ON DELETE SET NULL;

-- Update RLS policies to allow tasks without projects
DROP POLICY IF EXISTS "Users can create tasks for their projects" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks of their projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks of their projects" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks of their projects" ON tasks;

-- Create new RLS policies that handle tasks with or without projects
CREATE POLICY "Users can create their own tasks" 
ON tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" 
ON tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON tasks FOR DELETE 
USING (auth.uid() = user_id);