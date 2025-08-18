const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Production quick fix for Render database
async function productionQuickFix() {
  console.log('🚨 PRODUCTION QUICK FIX FOR RENDER DATABASE\n');
  
  // Use production database URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
  
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
    
  } catch (error) {
    console.error('❌ Error applying production quick fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the production fix
productionQuickFix().catch(console.error); 