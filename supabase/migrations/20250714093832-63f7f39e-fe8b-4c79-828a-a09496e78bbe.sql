
-- Fix RLS policies for task_attachments to handle both project and non-project tasks
DROP POLICY IF EXISTS "Users can create attachments for their project tasks" ON task_attachments;
DROP POLICY IF EXISTS "Users can view attachments of their project tasks" ON task_attachments;

-- Create new policies that handle both project and non-project tasks
CREATE POLICY "Users can create attachments for their tasks" 
ON task_attachments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_attachments.task_id 
    AND (
      -- For project tasks: user owns the project
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
      OR 
      -- For standalone tasks: user owns the task
      (t.project_id IS NULL AND t.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can view attachments of their tasks" 
ON task_attachments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_attachments.task_id 
    AND (
      -- For project tasks: user owns the project
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
      OR 
      -- For standalone tasks: user owns the task
      (t.project_id IS NULL AND t.user_id = auth.uid())
    )
  )
);
