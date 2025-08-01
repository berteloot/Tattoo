// Production Quick Fix Runner
// This script will be run on Render to fix existing user accounts

const { PrismaClient } = require('@prisma/client');

async function runProductionFix() {
  console.log('🚨 RUNNING PRODUCTION QUICK FIX ON RENDER\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Get all users
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users in production database`);
    
    // Update all users to be verified
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          isActive: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null
        }
      });
      
      console.log(`✅ Fixed: ${user.email}`);
    }
    
    console.log('\n🎉 ALL USERS FIXED!');
    console.log('Email verification disabled for all existing users.');
    console.log('You can now login with your existing passwords.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
runProductionFix(); 