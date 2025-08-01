const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Check all users and their verification status
async function checkAllUsers() {
  console.log('🔍 Checking All Users...\n');
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true,
        createdAt: true,
        role: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📋 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Verification Token: ${user.emailVerificationToken ? user.emailVerificationToken.substring(0, 20) + '...' : 'None'}`);
      console.log(`   Token Expiry: ${user.emailVerificationExpiry || 'None'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Check for the specific token from logs
    const token = '47f618d4beefefb9698517fc532ff1ea14ebf1f4469ead9fa5b4106babf4d3e1';
    console.log(`🔍 Looking for token: ${token.substring(0, 20)}...`);
    
    const userWithToken = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    });
    
    if (userWithToken) {
      console.log('✅ Found user with this token:');
      console.log('Email:', userWithToken.email);
      console.log('Name:', `${userWithToken.firstName} ${userWithToken.lastName}`);
      console.log('Verified:', userWithToken.emailVerified);
      console.log('Expiry:', userWithToken.emailVerificationExpiry);
    } else {
      console.log('❌ No user found with this token');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAllUsers().catch(console.error); 