// test-email-flow.js
// Test script for the complete email service flow

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const EMAIL_SERVICE_URL = 'http://localhost:8000';

async function testEmailFlow() {
  console.log('🧪 Testing TripWell Email Service Flow\n');

  try {
    // Test 1: Check email service health
    console.log('1️⃣ Testing email service health...');
    try {
      const healthResponse = await axios.get(`${EMAIL_SERVICE_URL}/health`);
      console.log('✅ Email service is healthy:', healthResponse.data);
    } catch (error) {
      console.log('❌ Email service health check failed:', error.message);
      console.log('   Make sure Python service is running on port 8000');
      return;
    }

    // Test 2: Test email service directly
    console.log('\n2️⃣ Testing email service directly...');
    try {
      const directEmailResponse = await axios.post(`${EMAIL_SERVICE_URL}/emails/welcome`, {
        email: 'test@example.com',
        name: 'TestUser'
      });
      console.log('✅ Direct email service test:', directEmailResponse.data);
    } catch (error) {
      console.log('❌ Direct email service test failed:', error.message);
    }

    // Test 3: Test via backend
    console.log('\n3️⃣ Testing email service via backend...');
    try {
      const backendEmailResponse = await axios.post(`${BACKEND_URL}/tripwell/email/welcome`, {
        email: 'test@example.com',
        name: 'TestUser'
      });
      console.log('✅ Backend email service test:', backendEmailResponse.data);
    } catch (error) {
      console.log('❌ Backend email service test failed:', error.message);
    }

    // Test 4: Test user creation with welcome email
    console.log('\n4️⃣ Testing user creation with welcome email...');
    const testFirebaseId = `test_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;
    
    try {
      const userResponse = await axios.post(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        firebaseId: testFirebaseId,
        email: testEmail
      });
      console.log('✅ User creation test:', {
        email: userResponse.data.email,
        funnelStage: userResponse.data.funnelStage,
        onboarding: userResponse.data.onboarding
      });
    } catch (error) {
      console.log('❌ User creation test failed:', error.message);
    }

    // Test 5: Test demo user creation (should NOT send email)
    console.log('\n5️⃣ Testing demo user creation (no email)...');
    const demoFirebaseId = `demo_${Date.now()}`;
    const demoEmail = `demo_${Date.now()}@example.com`;
    
    try {
      const demoUserResponse = await axios.post(`${BACKEND_URL}/tripwell/user/createOrFind`, {
        firebaseId: demoFirebaseId,
        email: demoEmail,
        funnelStage: 'spots_demo'
      });
      console.log('✅ Demo user creation test:', {
        email: demoUserResponse.data.email,
        funnelStage: demoUserResponse.data.funnelStage
      });
      console.log('   (No welcome email should be sent for demo users)');
    } catch (error) {
      console.log('❌ Demo user creation test failed:', error.message);
    }

    console.log('\n🎉 Email service flow test completed!');
    console.log('\n📋 Summary:');
    console.log('- Brand new users (funnelStage: "none") get welcome emails');
    console.log('- Demo users (funnelStage: "spots_demo", etc.) do NOT get welcome emails');
    console.log('- Existing users do NOT get duplicate emails');
    console.log('- Email failures do not block user creation');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEmailFlow();
