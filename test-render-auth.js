#!/usr/bin/env node

/**
 * Render Authentication Test
 * This script tests the authentication system on Render deployment
 */

const axios = require('axios');

// Render URLs (update these with your actual Render URLs)
const RENDER_BACKEND_URL = 'https://tattoo-app-backend.onrender.com';
const RENDER_FRONTEND_URL = 'https://tattoo-app-frontend.onrender.com';

const TEST_USER = {
  firstName: 'Render',
  lastName: 'Tester',
  email: 'render.tester@example.com',
  password: 'testpass123',
  role: 'CLIENT'
};

class RenderAuthTester {
  constructor() {
    this.baseURL = RENDER_BACKEND_URL;
    this.tokens = {};
  }

  async testEndpoint(endpoint, method = 'GET', data = null, token = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout for Render
      };

      if (data) {
        config.data = data;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
        networkError: error.code
      };
    }
  }

  async testHealthCheck() {
    console.log('\n🔵 Testing Health Check...');
    console.log('=' .repeat(50));

    const result = await this.testEndpoint('/health');

    if (result.success) {
      console.log('✅ Health check successful!');
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Environment: ${result.data.environment}`);
      console.log(`   Timestamp: ${result.data.timestamp}`);
      return true;
    } else {
      console.log('❌ Health check failed!');
      console.log(`   Error: ${result.error}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Network Error: ${result.networkError}`);
      return false;
    }
  }

  async testRegistration() {
    console.log('\n🔵 Testing Registration...');
    console.log('=' .repeat(50));

    const result = await this.testEndpoint('/api/auth/register', 'POST', TEST_USER);

    if (result.success) {
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${result.data.data.user.id}`);
      console.log(`   Email: ${result.data.data.user.email}`);
      console.log(`   Role: ${result.data.data.user.role}`);
      console.log(`   Token received: ${result.data.data.token ? 'Yes' : 'No'}`);
      
      this.tokens.client = result.data.data.token;
      return true;
    } else {
      console.log('❌ Registration failed!');
      console.log(`   Error: ${result.error.error || result.error}`);
      console.log(`   Status: ${result.status}`);
      return false;
    }
  }

  async testLogin() {
    console.log('\n🔵 Testing Login...');
    console.log('=' .repeat(50));

    const loginData = {
      email: TEST_USER.email,
      password: TEST_USER.password
    };

    const result = await this.testEndpoint('/api/auth/login', 'POST', loginData);

    if (result.success) {
      console.log('✅ Login successful!');
      console.log(`   User ID: ${result.data.data.user.id}`);
      console.log(`   Email: ${result.data.data.user.email}`);
      console.log(`   Role: ${result.data.data.user.role}`);
      console.log(`   Token received: ${result.data.data.token ? 'Yes' : 'No'}`);
      
      this.tokens.client = result.data.data.token;
      return true;
    } else {
      console.log('❌ Login failed!');
      console.log(`   Error: ${result.error.error || result.error}`);
      console.log(`   Status: ${result.status}`);
      return false;
    }
  }

  async testProfileAccess() {
    console.log('\n🔵 Testing Profile Access...');
    console.log('=' .repeat(50));

    const token = this.tokens.client;
    if (!token) {
      console.log('❌ No token available for profile test');
      return false;
    }

    const result = await this.testEndpoint('/api/auth/me', 'GET', null, token);

    if (result.success) {
      console.log('✅ Profile access successful!');
      console.log(`   User ID: ${result.data.data.user.id}`);
      console.log(`   Email: ${result.data.data.user.email}`);
      console.log(`   Role: ${result.data.data.user.role}`);
      return true;
    } else {
      console.log('❌ Profile access failed!');
      console.log(`   Error: ${result.error.error || result.error}`);
      console.log(`   Status: ${result.status}`);
      return false;
    }
  }

  async testLogout() {
    console.log('\n🔵 Testing Logout...');
    console.log('=' .repeat(50));

    const token = this.tokens.client;
    if (!token) {
      console.log('❌ No token available for logout test');
      return false;
    }

    const result = await this.testEndpoint('/api/auth/logout', 'POST', null, token);

    if (result.success) {
      console.log('✅ Logout successful!');
      console.log(`   Message: ${result.data.message}`);
      return true;
    } else {
      console.log('❌ Logout failed!');
      console.log(`   Error: ${result.error.error || result.error}`);
      console.log(`   Status: ${result.status}`);
      return false;
    }
  }

  async runCompleteTest() {
    console.log('🚀 Starting Render Authentication Test');
    console.log('=' .repeat(60));
    console.log(`🌐 Backend URL: ${this.baseURL}`);
    console.log(`🌐 Frontend URL: ${RENDER_FRONTEND_URL}`);

    // Test health check first
    const healthOk = await this.testHealthCheck();
    if (!healthOk) {
      console.log('\n❌ Health check failed - stopping tests');
      return;
    }

    // Test authentication flow
    await this.testRegistration();
    await this.testLogin();
    await this.testProfileAccess();
    await this.testLogout();

    console.log('\n🎉 Render Authentication Test Complete!');
    console.log('=' .repeat(60));
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Health Check: ${healthOk ? '✅' : '❌'}`);
    console.log(`   Authentication Token: ${this.tokens.client ? '✅' : '❌'}`);
  }
}

// Run the test
async function main() {
  const tester = new RenderAuthTester();
  await tester.runCompleteTest();
}

main().catch(console.error); 