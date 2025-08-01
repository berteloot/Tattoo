// Direct Production Database Fix
// This script will be run directly on Render to fix all users

const { PrismaClient } = require('@prisma/client');

async function directProductionFix() {
  console.log('🚨 DIRECT PRODUCTION DATABASE FIX\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Get all users from production database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        role: true,
        isActive: true
      }
    });
    
    console.log(`Found ${users.length} users in production database`);
    
    // Update all users to be verified and active
    const updatePromises = users.map(user => 
      prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          isActive: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null
        }
      })
    );
    
    await Promise.all(updatePromises);
    
    console.log('✅ All production users updated successfully!');
    console.log('Email verification has been disabled for all existing users.');
    
    // Show the accounts that were fixed
    console.log('\n📋 Production accounts that were fixed:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });
    
    // Special handling for your accounts
    const yourAccounts = users.filter(user => 
      user.email === 'stan@altilead.com' || user.email === 'berteloot@gmail.com'
    );
    
    if (yourAccounts.length > 0) {
      console.log('\n🎯 YOUR ACCOUNTS FIXED:');
      yourAccounts.forEach(user => {
        console.log(`✅ ${user.email} - Now verified and accessible`);
      });
      console.log('\nYou should now be able to login with your existing passwords!');
    } else {
      console.log('\n⚠️ Your accounts (stan@altilead.com, berteloot@gmail.com) not found in production database');
    }
    
    // Test admin account specifically
    const adminAccount = users.find(user => user.email === 'admin@tattoolocator.com');
    if (adminAccount) {
      console.log('\n🔧 ADMIN ACCOUNT FIXED:');
      console.log(`✅ ${adminAccount.email} - Now verified and accessible`);
      console.log('Admin dashboard should now be accessible!');
    }
    
  } catch (error) {
    console.error('❌ Error applying direct production fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the direct fix
directProductionFix().catch(console.error); 