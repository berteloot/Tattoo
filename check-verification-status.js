const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVerificationStatus() {
  try {
    console.log('🔍 Checking verification status values in database...\n');

    // Get all studios with their verification status
    const studios = await prisma.studio.findMany({
      select: {
        id: true,
        title: true,
        verificationStatus: true,
        isVerified: true
      }
    });

    console.log(`📊 Found ${studios.length} studios`);
    
    // Group by verification status
    const statusCounts = {};
    studios.forEach(studio => {
      const status = studio.verificationStatus || 'NULL';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\n📋 Verification Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} studios`);
    });

    // Show some examples
    console.log('\n📋 Sample Studios:');
    studios.slice(0, 5).forEach(studio => {
      console.log(`   ${studio.title}: status="${studio.verificationStatus}", verified=${studio.isVerified}`);
    });

    // Test a simple query with status filter
    console.log('\n🧪 Testing status filter query...');
    try {
      const approvedStudios = await prisma.studio.findMany({
        where: {
          verificationStatus: 'APPROVED'
        },
        select: {
          id: true,
          title: true,
          verificationStatus: true
        }
      });
      console.log(`✅ Found ${approvedStudios.length} approved studios`);
    } catch (error) {
      console.log('❌ Status filter query failed:', error.message);
    }

    // Test with different status values
    const testStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
    for (const status of testStatuses) {
      try {
        const studiosWithStatus = await prisma.studio.findMany({
          where: {
            verificationStatus: status
          },
          select: {
            id: true,
            title: true,
            verificationStatus: true
          }
        });
        console.log(`✅ Status "${status}": ${studiosWithStatus.length} studios`);
      } catch (error) {
        console.log(`❌ Status "${status}" query failed:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVerificationStatus(); 