const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Quick fix: Disable email verification for existing users
async function quickFixDisableVerification() {
  console.log('🔧 QUICK FIX: Disabling Email Verification for Existing Users\n');
  
  try {
    // Get all existing users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        role: true
      }
    });
    
    console.log(`Found ${users.length} users in database`);
    
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
    
    console.log('✅ All users updated successfully!');
    console.log('Email verification has been disabled for existing users.');
    console.log('\nYou should now be able to login with your existing passwords.');
    
    // Show the accounts that were fixed
    console.log('\n📋 Accounts that were fixed:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error applying quick fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the quick fix
quickFixDisableVerification().catch(console.error); 