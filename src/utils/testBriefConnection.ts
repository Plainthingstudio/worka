import { supabase } from '@/integrations/supabase/client';

export const testBriefConnection = async () => {
  try {
    console.log('Testing brief connection functionality...');

    // Test 1: Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    console.log('✓ User authenticated:', user.id);

    // Test 2: Try to fetch available briefs
    console.log('Fetching available briefs...');
    const { data: briefs, error: briefsError } = await supabase.rpc('get_user_briefs', {
      user_uuid: user.id
    });
    
    if (briefsError) {
      console.error('Error fetching briefs:', briefsError);
      return;
    }
    console.log('✓ Briefs fetched successfully:', briefs?.length || 0);

    // Test 3: Try to create a test task
    console.log('Creating test task...');
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Test Task for Brief Connection',
        description: 'Testing brief connection functionality',
        user_id: user.id,
        status: 'Planning',
        priority: 'Normal',
        task_type: 'Primary'
      })
      .select()
      .single();

    if (taskError) {
      console.error('Error creating task:', taskError);
      return;
    }
    console.log('✓ Test task created:', task.id);

    // Test 4: Try to connect a brief to the task (if briefs exist)
    if (briefs && briefs.length > 0) {
      console.log('Testing brief connection...');
      const { error: connectError } = await supabase
        .from('tasks')
        .update({
          brief_id: briefs[0].id,
          brief_type: briefs[0].type,
        })
        .eq('id', task.id);

      if (connectError) {
        console.error('Error connecting brief to task:', connectError);
      } else {
        console.log('✓ Brief connected successfully');
      }
    } else {
      console.log('No briefs available to test connection');
    }

    // Clean up - delete test task
    await supabase.from('tasks').delete().eq('id', task.id);
    console.log('✓ Test task cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Call this function to test
if (typeof window !== 'undefined') {
  (window as any).testBriefConnection = testBriefConnection;
}