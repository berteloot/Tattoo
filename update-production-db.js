const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProductionDatabase() {
  try {
    console.log('🔄 Updating production database...');
    
    // Add ARTIST_ADMIN role to the UserRole enum
    await prisma.$executeRaw`ALTER TYPE "UserRole" ADD VALUE 'ARTIST_ADMIN';`;
    
    console.log('✅ Successfully added ARTIST_ADMIN role to UserRole enum');
    
    // Verify the role was added
    const roles = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"UserRole")) as role;
    `;
    
    console.log('📋 Available roles in database:');
    roles.forEach(role => {
      console.log(`  - ${role.role}`);
    });
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  ARTIST_ADMIN role already exists in database');
    } else {
      console.error('❌ Error updating database:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateProductionDatabase(); 