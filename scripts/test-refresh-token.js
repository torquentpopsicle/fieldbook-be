const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testRefreshToken() {
  try {
    console.log('🔄 Testing Refresh Token Functionality\n');

    // Step 1: Login to get access and refresh tokens
    console.log('1. Logging in to get tokens...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'customer@example.com',
      password: 'customer123',
    });

    const { access_token, refresh_token } = loginResponse.data.data;
    console.log('✅ Login successful');
    console.log('📋 Access Token:', access_token.substring(0, 50) + '...');
    console.log('📋 Refresh Token:', refresh_token.substring(0, 50) + '...\n');

    // Step 2: Test accessing protected endpoint with access token
    console.log('2. Testing protected endpoint with access token...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      console.log('✅ Protected endpoint accessed successfully');
      console.log('👤 User:', profileResponse.data.data.name);
    } catch (error) {
      console.log(
        '❌ Failed to access protected endpoint:',
        error.response?.data?.message || error.message
      );
    }

    // Step 3: Test token refresh
    console.log('\n3. Testing token refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
      refresh_token: refresh_token,
    });

    const newAccessToken = refreshResponse.data.data.access_token;
    const newRefreshToken = refreshResponse.data.data.refresh_token;
    console.log('✅ Token refresh successful');
    console.log(
      '📋 New Access Token:',
      newAccessToken.substring(0, 50) + '...'
    );
    console.log(
      '📋 New Refresh Token:',
      newRefreshToken.substring(0, 50) + '...\n'
    );

    // Step 4: Test accessing protected endpoint with new access token
    console.log('4. Testing protected endpoint with new access token...');
    try {
      const newProfileResponse = await axios.get(`${BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
      console.log('✅ Protected endpoint accessed successfully with new token');
      console.log('👤 User:', newProfileResponse.data.data.name);
    } catch (error) {
      console.log(
        '❌ Failed to access protected endpoint with new token:',
        error.response?.data?.message || error.message
      );
    }

    // Step 5: Test invalid refresh token
    console.log('\n5. Testing invalid refresh token...');
    try {
      await axios.post(`${BASE_URL}/auth/refresh`, {
        refresh_token: 'invalid_token_here',
      });
    } catch (error) {
      console.log('✅ Correctly rejected invalid refresh token');
      console.log('📋 Error:', error.response?.data?.message || error.message);
    }

    // Step 6: Test missing refresh token
    console.log('\n6. Testing missing refresh token...');
    try {
      await axios.post(`${BASE_URL}/auth/refresh`, {});
    } catch (error) {
      console.log('✅ Correctly rejected missing refresh token');
      console.log('📋 Error:', error.response?.data?.message || error.message);
    }

    console.log(
      '\n🎉 Refresh token functionality test completed successfully!'
    );
  } catch (error) {
    console.error(
      '❌ Test failed:',
      error.response?.data?.message || error.message
    );
  }
}

// Run the test
testRefreshToken();
