const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Regenerating Prisma client...');

try {
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Remove existing Prisma client
  const prismaClientPath = path.join(__dirname, 'node_modules/@prisma/client');
  if (fs.existsSync(prismaClientPath)) {
    console.log('🗑️ Removing existing Prisma client...');
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
  }
  
  // Regenerate Prisma client
  console.log('🔧 Generating new Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('✅ Prisma client regenerated successfully!');
  
  // Test the new client
  console.log('🧪 Testing new Prisma client...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  // Test a simple query to make sure the client works
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  console.log('✅ Prisma client test successful:', result);
  
  await prisma.$disconnect();
  
} catch (error) {
  console.error('❌ Error regenerating Prisma client:', error);
  process.exit(1);
} 