const bcrypt = require('bcryptjs');
const { prisma } = require('../src/utils/prisma');

async function createArtistAdminUser(email, password, firstName, lastName) {
  try {
    console.log('🔧 Creating ARTIST_ADMIN user...');
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // Update existing user to ARTIST_ADMIN
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ARTIST_ADMIN',
          isActive: true,
          isVerified: true,
          password: hashedPassword
        }
      });
      
      console.log('✅ Updated existing user to ARTIST_ADMIN:', {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName
      });
    } else {
      // Create new ARTIST_ADMIN user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ARTIST_ADMIN',
          isActive: true,
          isVerified: true,
          phone: '+1234567890'
        }
      });
      
      console.log('✅ Created new ARTIST_ADMIN user:', {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      });
    }
    
    console.log('\n🎉 ARTIST_ADMIN user setup complete!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('🎨 Role: ARTIST_ADMIN (Artist + Admin permissions)');
    
  } catch (error) {
    console.error('❌ Error creating ARTIST_ADMIN user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage - modify these values as needed
const email = 'artistadmin@example.com';
const password = 'artistadmin123';
const firstName = 'Artist';
const lastName = 'Admin';

createArtistAdminUser(email, password, firstName, lastName);
