const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin() {
  console.log('🔄 Making berteloot@gmail.com an admin...');
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'berteloot@gmail.com' }
    });

    if (!user) {
      console.log('❌ User berteloot@gmail.com not found. Creating new admin user...');
      
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: 'berteloot@gmail.com',
          password: '$2a$10$dummy.hash.for.admin.user', // Will need to be reset
          firstName: 'Stanislas',
          lastName: 'Berteloot',
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
          phone: '+1234567890'
        }
      });
      
      console.log('✅ Created new admin user:', newAdmin.email);
      console.log('⚠️  Note: You will need to reset the password for this user');
      
    } else {
      console.log('✅ User found:', user.email);
      console.log('Current role:', user.role);
      
      if (user.role === 'ADMIN') {
        console.log('ℹ️  User is already an admin');
      } else {
        // Update user to admin
        const updatedUser = await prisma.user.update({
          where: { email: 'berteloot@gmail.com' },
          data: {
            role: 'ADMIN',
            isActive: true,
            isVerified: true
          }
        });
        
        console.log('✅ Updated user to admin:', updatedUser.email);
        console.log('New role:', updatedUser.role);
      }
    }

    console.log('🎉 Admin setup completed!');
    
  } catch (error) {
    console.error('❌ Error making admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
makeAdmin()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 