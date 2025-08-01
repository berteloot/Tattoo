const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Reset password for stan@altilead.com
async function resetStanPassword() {
  console.log('🔧 Resetting password for stan@altilead.com...\n');
  
  try {
    // Find the user
    const user = await prisma.user.findFirst({
      where: {
        email: 'stan@altilead.com'
      }
    });
    
    if (!user) {
      console.log('❌ User stan@altilead.com not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Email Verified:', user.emailVerified);
    
    // Hash new password
    const newPassword = 'stan123456';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });
    
    console.log('✅ Password updated successfully!');
    console.log('New password:', newPassword);
    console.log('\nYou can now login with:');
    console.log('Email: stan@altilead.com');
    console.log('Password: stan123456');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetStanPassword().catch(console.error); 