const axios = require('axios');

const BASE_URL = 'https://fieldbook-be.onrender.com';

async function testCORS() {
  console.log('🔄 Testing CORS Configuration\n');

  const testCases = [
    {
      name: 'Health Check (GET)',
      method: 'GET',
      url: `${BASE_URL}/`,
      headers: {},
    },
    {
      name: 'CORS Debug (GET)',
      method: 'GET',
      url: `${BASE_URL}/api/v1/cors-debug`,
      headers: {},
    },
    {
      name: 'Login (POST)',
      method: 'POST',
      url: `${BASE_URL}/api/v1/auth/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        email: 'customer@example.com',
        password: 'customer123',
      },
    },
    {
      name: 'Login with Origin Header (POST)',
      method: 'POST',
      url: `${BASE_URL}/api/v1/auth/login`,
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://fieldbook-fe.vercel.app',
      },
      data: {
        email: 'customer@example.com',
        password: 'customer123',
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`🔗 URL: ${testCase.url}`);
    console.log(`📤 Method: ${testCase.method}`);
    console.log(`📋 Headers:`, testCase.headers);

    try {
      const response = await axios({
        method: testCase.method,
        url: testCase.url,
        headers: testCase.headers,
        data: testCase.data,
        timeout: 10000,
      });

      console.log('✅ SUCCESS');
      console.log('📊 Status:', response.status);
      console.log('📋 Response Headers:', {
        'access-control-allow-origin':
          response.headers['access-control-allow-origin'],
        'access-control-allow-methods':
          response.headers['access-control-allow-methods'],
        'access-control-allow-headers':
          response.headers['access-control-allow-headers'],
      });

      if (response.data) {
        console.log(
          '📄 Response Data:',
          JSON.stringify(response.data, null, 2)
        );
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.log('📊 Status:', error.response?.status);
      console.log('📋 Error Headers:', {
        'access-control-allow-origin':
          error.response?.headers['access-control-allow-origin'],
        'access-control-allow-methods':
          error.response?.headers['access-control-allow-methods'],
        'access-control-allow-headers':
          error.response?.headers['access-control-allow-headers'],
      });
      console.log('📄 Error Message:', error.response?.data || error.message);
    }
  }

  console.log('\n🎯 CORS Test Summary:');
  console.log('If you see CORS errors, check:');
  console.log('1. Server is running and accessible');
  console.log('2. Origin is correctly configured');
  console.log('3. Preflight requests are handled');
  console.log('4. No double slashes in URLs');
}

// Test with cURL equivalent
async function testWithCurl() {
  console.log('\n🔄 Testing with cURL equivalent...\n');

  const curlCommands = [
    `curl -X GET "${BASE_URL}/" -H "Origin: https://fieldbook-fe.vercel.app" -v`,
    `curl -X GET "${BASE_URL}/api/v1/cors-debug" -H "Origin: https://fieldbook-fe.vercel.app" -v`,
    `curl -X POST "${BASE_URL}/api/v1/auth/login" -H "Content-Type: application/json" -H "Origin: https://fieldbook-fe.vercel.app" -d '{"email":"customer@example.com","password":"customer123"}' -v`,
  ];

  console.log('Run these commands to test CORS manually:');
  curlCommands.forEach((cmd, index) => {
    console.log(`${index + 1}. ${cmd}`);
  });
}

// Run tests
testCORS()
  .then(() => {
    testWithCurl();
  })
  .catch(console.error);
