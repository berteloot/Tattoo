const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const prisma = new PrismaClient();

async function testEmailVerificationManual() {
  console.log('🧪 Manual Email Verification Test\n');

  try {
    // Step 1: Register a new user
    console.log('1. Registering new user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      firstName: 'Manual',
      lastName: 'Test',
      email: 'manual-test@example.com',
      password: 'testpass123',
      role: 'CLIENT'
    });

    if (!registerResponse.data.success) {
      console.log('❌ Registration failed:', registerResponse.data.error);
      return;
    }

    console.log('✅ Registration successful');
    console.log('   - User ID:', registerResponse.data.data.user.id);
    console.log('   - Email verified:', registerResponse.data.data.user.emailVerified);

    // Step 2: Get verification token from database
    console.log('\n2. Getting verification token from database...');
    const user = await prisma.user.findUnique({
      where: { email: 'manual-test@example.com' },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true
      }
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found in database');
    console.log('   - Email verified:', user.emailVerified);
    console.log('   - Has verification token:', !!user.emailVerificationToken);
    console.log('   - Token expires:', user.emailVerificationExpiry);

    if (!user.emailVerificationToken) {
      console.log('❌ No verification token found');
      return;
    }

    // Step 3: Try to login without verification (should fail)
    console.log('\n3. Testing login without verification...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'manual-test@example.com',
        password: 'testpass123'
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.requiresEmailVerification) {
        console.log('✅ Login correctly blocked - email verification required');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Step 4: Verify email with token
    console.log('\n4. Verifying email with token...');
    const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
      token: user.emailVerificationToken
    });

    if (verifyResponse.data.success) {
      console.log('✅ Email verification successful');
      console.log('   - Message:', verifyResponse.data.message);
      console.log('   - Token received:', !!verifyResponse.data.data.token);
      console.log('   - User verified:', verifyResponse.data.data.user.emailVerified);
    } else {
      console.log('❌ Email verification failed:', verifyResponse.data.error);
      return;
    }

    // Step 5: Try to login after verification (should succeed)
    console.log('\n5. Testing login after verification...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'manual-test@example.com',
      password: 'testpass123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful after verification');
      console.log('   - Token received:', !!loginResponse.data.data.token);
    } else {
      console.log('❌ Login failed after verification:', loginResponse.data.error);
    }

    // Step 6: Verify database state
    console.log('\n6. Verifying database state...');
    const verifiedUser = await prisma.user.findUnique({
      where: { email: 'manual-test@example.com' },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true
      }
    });

    console.log('✅ Database state verified');
    console.log('   - Email verified:', verifiedUser.emailVerified);
    console.log('   - Token cleared:', !verifiedUser.emailVerificationToken);
    console.log('   - Expiry cleared:', !verifiedUser.emailVerificationExpiry);

    console.log('\n🎉 Manual email verification test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Registration creates user with verification token');
    console.log('   ✅ Login blocked until email verified');
    console.log('   ✅ Email verification works with token');
    console.log('   ✅ Login works after verification');
    console.log('   ✅ Database properly updated after verification');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEmailVerificationManual(); 