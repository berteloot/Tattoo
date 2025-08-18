const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Connect to production database using Render's DATABASE_URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://tattoo_app_user:password@localhost:5432/tattoo_app'
    }
  }
});

// Recover accounts from Render production database
async function recoverRenderAccounts() {
  console.log('🚨 RECOVERING RENDER PRODUCTION ACCOUNTS\n');
  
  const accounts = ['stan@altilead.com', 'berteloot@gmail.com'];
  
  for (const email of accounts) {
    console.log(`\n🔍 Checking production account: ${email}`);
    
    try {
      // Find the user in production database
      const user = await prisma.user.findFirst({
        where: { email }
      });
      
      if (!user) {
        console.log(`❌ User ${email} not found in production database`);
        continue;
      }
      
      console.log('✅ User found in production:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', `${user.firstName} ${user.lastName}`);
      console.log('Role:', user.role);
      console.log('Email Verified:', user.emailVerified);
      console.log('Is Active:', user.isActive);
      console.log('Created:', user.createdAt);
      
      // Reset password and ensure account is accessible
      const newPassword = 'render123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update user to ensure it's accessible
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
      
      console.log('✅ Production account recovered!');
      console.log('New login credentials:');
      console.log(`Email: ${email}`);
      console.log('Password: render123');
      
    } catch (error) {
      console.log(`❌ Error recovering ${email}:`, error.message);
    }
  }
  
  console.log('\n📋 PRODUCTION RECOVERY SUMMARY:');
  console.log('If accounts were found and recovered, you can now login to Render with:');
  console.log('Password: render123');
  console.log('\nURL: https://tattooed-world-backend.onrender.com/');
}

// Run the recovery
recoverRenderAccounts().catch(console.error); 