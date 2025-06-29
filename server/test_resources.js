import axios from 'axios';

const testResourcesAPI = async () => {
  try {
    console.log('🧪 Testing AI Resource Recommender API...\n');

    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/resources/health');
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Resource suggestion
    console.log('2️⃣ Testing resource suggestion...');
    const testTopics = ['JavaScript Basics', 'React Hooks'];
    const resourceResponse = await axios.post('http://localhost:5000/api/resources/suggest', {
      topics: testTopics
    });
    console.log('✅ Resource suggestion successful!');
    console.log('📊 Response:', JSON.stringify(resourceResponse.data, null, 2));
    console.log('');

    console.log('🎉 All tests passed! The AI Resource Recommender is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testResourcesAPI(); 