const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Emergency account recovery
async function emergencyAccountRecovery() {
  console.log('🚨 EMERGENCY ACCOUNT RECOVERY\n');
  
  const accounts = ['stan@altilead.com', 'berteloot@gmail.com'];
  
  for (const email of accounts) {
    console.log(`\n🔍 Checking account: ${email}`);
    
    try {
      // Find the user
      const user = await prisma.user.findFirst({
        where: { email }
      });
      
      if (!user) {
        console.log(`❌ User ${email} not found in local database`);
        console.log('This account might be in production database only');
        continue;
      }
      
      console.log('✅ User found:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', `${user.firstName} ${user.lastName}`);
      console.log('Role:', user.role);
      console.log('Email Verified:', user.emailVerified);
      console.log('Is Active:', user.isActive);
      console.log('Created:', user.createdAt);
      
      // Reset password to a known value
      const newPassword = 'recovery123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          emailVerified: true,
          isActive: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null
        }
      });
      
      console.log('✅ Account recovered!');
      console.log('New login credentials:');
      console.log(`Email: ${email}`);
      console.log('Password: recovery123');
      
    } catch (error) {
      console.log(`❌ Error recovering ${email}:`, error.message);
    }
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('If accounts were found and recovered, you can now login with:');
  console.log('Password: recovery123');
  console.log('\nIf accounts were not found locally, they exist in production only.');
}

// Run the recovery
emergencyAccountRecovery().catch(console.error); 