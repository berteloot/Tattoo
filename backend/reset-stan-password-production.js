const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Reset stan@altilead.com password in production
async function resetStanPassword() {
  console.log('🔧 RESETTING STAN PASSWORD IN PRODUCTION\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Find stan's account
    const stanUser = await prisma.user.findUnique({
      where: { email: 'stan@altilead.com' }
    });
    
    if (!stanUser) {
      console.log('❌ stan@altilead.com not found in production database');
      return;
    }
    
    console.log('✅ Found stan@altilead.com account');
    console.log('Current status:', {
      id: stanUser.id,
      email: stanUser.email,
      role: stanUser.role,
      emailVerified: stanUser.emailVerified,
      isActive: stanUser.isActive
    });
    
    // Hash new password
    const newPassword = 'stan123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await prisma.user.update({
      where: { id: stanUser.id },
      data: {
        password: hashedPassword,
        emailVerified: true,
        isActive: true
      }
    });
    
    console.log('✅ Password reset successfully!');
    console.log('New password:', newPassword);
    console.log('Account is now verified and active');
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetStanPassword().catch(console.error); 