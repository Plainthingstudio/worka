
-- Update RLS policies for tasks to allow administrators full access
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;

-- Create new policies that allow administrators and owners to access all tasks
CREATE POLICY "Users can view tasks" 
ON tasks FOR SELECT 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Users can create tasks" 
ON tasks FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Users can update tasks" 
ON tasks FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

CREATE POLICY "Users can delete tasks" 
ON tasks FOR DELETE 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role)
);

-- Also update task_comments policies for administrators
DROP POLICY IF EXISTS "Users can view comments of their tasks" ON task_comments;
DROP POLICY IF EXISTS "Users can create comments for their tasks" ON task_comments;

CREATE POLICY "Users can view task comments" 
ON task_comments FOR SELECT 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR
  EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_comments.task_id 
    AND (
      (t.project_id IS NULL AND t.user_id = auth.uid()) OR
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can create task comments" 
ON task_comments FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR
  EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_comments.task_id 
    AND (
      (t.project_id IS NULL AND t.user_id = auth.uid()) OR
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
    )
  )
);

-- Update task_attachments policies for administrators
DROP POLICY IF EXISTS "Users can view attachments of their tasks" ON task_attachments;
DROP POLICY IF EXISTS "Users can create attachments for their tasks" ON task_attachments;

CREATE POLICY "Users can view task attachments" 
ON task_attachments FOR SELECT 
USING (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR
  EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_attachments.task_id 
    AND (
      (t.project_id IS NULL AND t.user_id = auth.uid()) OR
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
    )
  )
);

CREATE POLICY "Users can create task attachments" 
ON task_attachments FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'owner'::app_role) OR 
  has_role(auth.uid(), 'administrator'::app_role) OR
  EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_attachments.task_id 
    AND (
      (t.project_id IS NULL AND t.user_id = auth.uid()) OR
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
    )
  )
);
