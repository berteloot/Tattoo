const bcrypt = require('bcryptjs');
const { prisma } = require('../src/utils/prisma');

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    const email = 'berteloot@gmail.com';
    const password = 'admin123'; // You can change this password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
          password: hashedPassword
        }
      });
      
      console.log('✅ Updated existing user to admin:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      });
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
          phone: '+1234567890'
        }
      });
      
      console.log('✅ Created new admin user:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      });
    }
    
    console.log('\n🎉 Admin user setup complete!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('⚠️  Please change the password after first login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 