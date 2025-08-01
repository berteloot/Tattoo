const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Check user verification status
async function checkUserVerification() {
  console.log('🔍 Checking User Verification Status...\n');
  
  try {
    // Find user by email (assuming it's berteloot@gmail.com)
    const user = await prisma.user.findFirst({
      where: {
        email: 'berteloot@gmail.com'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found with email: berteloot@gmail.com');
      return;
    }
    
    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', `${user.firstName} ${user.lastName}`);
    console.log('Email Verified:', user.emailVerified);
    console.log('Verification Token:', user.emailVerificationToken);
    console.log('Token Expiry:', user.emailVerificationExpiry);
    console.log('Created At:', user.createdAt);
    
    // Check if token is expired
    if (user.emailVerificationExpiry) {
      const now = new Date();
      const isExpired = now > user.emailVerificationExpiry;
      console.log('\nToken Status:');
      console.log('Current Time:', now);
      console.log('Token Expiry:', user.emailVerificationExpiry);
      console.log('Is Expired:', isExpired);
    }
    
    // Check all users with verification tokens
    console.log('\n📋 All users with verification tokens:');
    const usersWithTokens = await prisma.user.findMany({
      where: {
        emailVerificationToken: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true
      }
    });
    
    usersWithTokens.forEach(u => {
      console.log(`- ${u.email}: verified=${u.emailVerified}, token=${u.emailVerificationToken?.substring(0, 10)}...`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUserVerification().catch(console.error); 