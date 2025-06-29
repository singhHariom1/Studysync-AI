import axios from 'axios';

const testTasksAPI = async () => {
  try {
    console.log('🧪 Testing Task Planner API...\n');

    // Test 1: Create a task
    console.log('1️⃣ Testing task creation...');
    const createResponse = await axios.post('http://localhost:5000/api/tasks', {
      title: 'Study Operating Systems',
      subject: 'Operating Systems',
      dueDate: '2025-01-15',
      priority: 'high',
      description: 'Review process scheduling and memory management'
    });
    console.log('✅ Task created:', createResponse.data.task.title);
    const taskId = createResponse.data.task._id;

    // Test 2: Get all tasks
    console.log('\n2️⃣ Testing task retrieval...');
    const getResponse = await axios.get('http://localhost:5000/api/tasks');
    console.log('✅ Retrieved', getResponse.data.tasks.length, 'tasks');

    // Test 3: Toggle task completion
    console.log('\n3️⃣ Testing task toggle...');
    const toggleResponse = await axios.patch(`http://localhost:5000/api/tasks/${taskId}/toggle`);
    console.log('✅ Task toggled to:', toggleResponse.data.task.status);

    // Test 4: Get progress stats
    console.log('\n4️⃣ Testing progress stats...');
    const progressResponse = await axios.get('http://localhost:5000/api/tasks/progress');
    console.log('✅ Progress stats:', progressResponse.data);

    // Test 5: Update task
    console.log('\n5️⃣ Testing task update...');
    const updateResponse = await axios.patch(`http://localhost:5000/api/tasks/${taskId}`, {
      title: 'Study Operating Systems - Updated',
      priority: 'medium'
    });
    console.log('✅ Task updated:', updateResponse.data.task.title);

    // Test 6: Delete task
    console.log('\n6️⃣ Testing task deletion...');
    await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
    console.log('✅ Task deleted successfully');

    console.log('\n🎉 All Task Planner tests passed! The API is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testTasksAPI(); 