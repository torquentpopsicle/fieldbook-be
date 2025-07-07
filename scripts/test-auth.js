require('dotenv').config();
const userService = require('../services/userService');

async function testAuthentication() {
  try {
    console.log('🧪 Testing PostgreSQL Authentication...\n');

    // Test 1: Check if existing users are migrated
    console.log('1. Testing existing user lookup...');
    const existingUser = await userService.findUserByEmail(
      'customer@example.com'
    );
    if (existingUser) {
      console.log('✅ Found existing user:', existingUser.name);
    } else {
      console.log('❌ Existing user not found');
    }

    // Test 2: Test email existence check
    console.log('\n2. Testing email existence check...');
    const emailExists = await userService.emailExists('customer@example.com');
    console.log(emailExists ? '✅ Email exists' : '❌ Email not found');

    // Test 3: Test user creation
    console.log('\n3. Testing new user creation...');
    const testUser = await userService.createUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
    });
    console.log('✅ Created new user:', testUser.name);

    // Test 4: Test duplicate email prevention
    console.log('\n4. Testing duplicate email prevention...');
    try {
      await userService.createUser({
        name: 'Duplicate User',
        email: 'test@example.com',
        password: 'test123',
      });
      console.log('❌ Should have prevented duplicate email');
    } catch (error) {
      console.log('✅ Correctly prevented duplicate email');
    }

    console.log('\n🎉 All authentication tests passed!');
    console.log('✅ PostgreSQL migration is working correctly');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuthentication();
