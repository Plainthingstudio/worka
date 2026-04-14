import { account, databases, DATABASE_ID, ID, Query } from '@/integrations/appwrite/client';

export const testBriefConnection = async () => {
  try {
    console.log('Testing brief connection functionality...');

    // Test 1: Check if user is authenticated
    let user;
    try {
      user = await account.get();
    } catch {
      console.error('User not authenticated');
      return;
    }
    console.log('✓ User authenticated:', user.$id);

    // Test 2: Try to fetch available briefs
    console.log('Fetching available briefs...');
    let briefs: any[] = [];
    try {
      const response = await databases.listDocuments(DATABASE_ID, 'briefs', [
        Query.equal('user_id', user.$id)
      ]);
      briefs = response.documents;
      console.log('✓ Briefs fetched successfully:', briefs.length);
    } catch (briefsError) {
      console.error('Error fetching briefs:', briefsError);
      return;
    }

    // Test 3: Try to create a test task
    console.log('Creating test task...');
    let task: any;
    try {
      task = await databases.createDocument(DATABASE_ID, 'tasks', ID.unique(), {
        title: 'Test Task for Brief Connection',
        description: 'Testing brief connection functionality',
        user_id: user.$id,
        status: 'Planning',
        priority: 'Normal',
        task_type: 'Primary'
      });
      console.log('✓ Test task created:', task.$id);
    } catch (taskError) {
      console.error('Error creating task:', taskError);
      return;
    }

    // Test 4: Try to connect a brief to the task (if briefs exist)
    if (briefs && briefs.length > 0) {
      console.log('Testing brief connection...');
      try {
        await databases.updateDocument(DATABASE_ID, 'tasks', task.$id, {
          brief_id: briefs[0].$id,
          brief_type: briefs[0].type,
        });
        console.log('✓ Brief connected successfully');
      } catch (connectError) {
        console.error('Error connecting brief to task:', connectError);
      }
    } else {
      console.log('No briefs available to test connection');
    }

    // Clean up - delete test task
    await databases.deleteDocument(DATABASE_ID, 'tasks', task.$id);
    console.log('✓ Test task cleaned up');

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Call this function to test
if (typeof window !== 'undefined') {
  (window as any).testBriefConnection = testBriefConnection;
}
