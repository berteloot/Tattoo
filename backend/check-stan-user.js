const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Check for stan@altilead.com user
async function checkStanUser() {
  console.log('🔍 Checking for stan@altilead.com user...\n');
  
  try {
    // Find user by email
    const user = await prisma.user.findFirst({
      where: {
        email: 'stan@altilead.com'
      },
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
      }
    });
    
    if (!user) {
      console.log('❌ User stan@altilead.com not found in database');
      console.log('\nThis means:');
      console.log('1. The user was never created');
      console.log('2. The user was deleted');
      console.log('3. The email was entered incorrectly during registration');
      
      // Check for similar emails
      console.log('\n🔍 Checking for similar emails...');
      const similarUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'stan'
          }
        },
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      });
      
      if (similarUsers.length > 0) {
        console.log('Found similar emails:');
        similarUsers.forEach(u => {
          console.log(`- ${u.email} (${u.firstName} ${u.lastName})`);
        });
      } else {
        console.log('No similar emails found');
      }
      
      return;
    }
    
    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', `${user.firstName} ${user.lastName}`);
    console.log('Role:', user.role);
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
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkStanUser().catch(console.error); 