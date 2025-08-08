const { execSync } = require('child_process');

async function deployMigrations() {
  try {
    console.log('🚀 Deploying Database Migrations to Production...\n');
    
    // Step 1: Generate Prisma client
    console.log('1. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');
    
    // Step 2: Deploy migrations
    console.log('2. Deploying database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations deployed\n');
    
    // Step 3: Verify database connection
    console.log('3. Verifying database connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Step 4: Check if profile picture columns exist
    console.log('4. Checking profile picture columns...');
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'artist_profiles' 
      AND column_name LIKE 'profilePicture%'
      ORDER BY column_name;
    `;
    
    if (columns.length === 0) {
      console.log('❌ Profile picture columns missing - adding them...\n');
      
      // Add the missing columns
      await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureUrl" TEXT;`;
      await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePicturePublicId" TEXT;`;
      await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureWidth" INTEGER;`;
      await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureHeight" INTEGER;`;
      await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureFormat" TEXT;`;
      await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureBytes" INTEGER;`;
      
      console.log('✅ Profile picture columns added\n');
    } else {
      console.log('✅ Profile picture columns already exist:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
      console.log('');
    }
    
    // Step 5: Test gallery query
    console.log('5. Testing gallery query...');
    const galleryItems = await prisma.tattooGallery.findMany({
      take: 1,
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      }
    });
    console.log(`✅ Gallery query successful: ${galleryItems.length} items found\n`);
    
    await prisma.$disconnect();
    console.log('🎉 Database migrations deployed successfully!');
    
  } catch (error) {
    console.error('❌ Error deploying migrations:', error);
    process.exit(1);
  }
}

deployMigrations();
