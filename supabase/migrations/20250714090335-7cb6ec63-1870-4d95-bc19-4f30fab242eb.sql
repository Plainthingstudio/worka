-- Update the RLS policy for task_comments to handle tasks without projects
DROP POLICY "Users can create comments for their project tasks" ON task_comments;

-- Create a new policy that allows comments on both project tasks and personal tasks
CREATE POLICY "Users can create comments for their tasks" 
ON task_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_comments.task_id 
    AND (
      -- Personal tasks (no project) belonging to the user
      (t.project_id IS NULL AND t.user_id = auth.uid())
      OR 
      -- Project tasks where the project belongs to the user
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
    )
  )
);

-- Also update the view policy for consistency
DROP POLICY "Users can view comments of their project tasks" ON task_comments;

CREATE POLICY "Users can view comments of their tasks" 
ON task_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tasks t
    WHERE t.id = task_comments.task_id 
    AND (
      -- Personal tasks (no project) belonging to the user
      (t.project_id IS NULL AND t.user_id = auth.uid())
      OR 
      -- Project tasks where the project belongs to the user
      (t.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM projects p 
        WHERE p.id = t.project_id AND p.user_id = auth.uid()
      ))
    )
  )
);