const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tattoolocator.com' },
    update: {},
    create: {
      email: 'admin@tattoolocator.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
      phone: '+1234567890'
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test client user
  const clientPassword = await bcrypt.hash('client123', 10);
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      password: clientPassword,
      firstName: 'John',
      lastName: 'Client',
      role: 'CLIENT',
      isActive: true,
      isVerified: true,
      phone: '+1234567891'
    }
  });
  console.log('✅ Test client created:', client.email);

  // Create test artist user
  const artistPassword = await bcrypt.hash('artist123', 10);
  const artist = await prisma.user.upsert({
    where: { email: 'artist@example.com' },
    update: {},
    create: {
      email: 'artist@example.com',
      password: artistPassword,
      firstName: 'Sarah',
      lastName: 'Artist',
      role: 'ARTIST',
      isActive: true,
      isVerified: true,
      phone: '+1234567892'
    }
  });
  console.log('✅ Test artist created:', artist.email);

  // Create artist profile for test artist
  const artistProfile = await prisma.artistProfile.upsert({
    where: { userId: artist.id },
    update: {},
    create: {
      userId: artist.id,
      bio: 'Professional tattoo artist with 10+ years of experience specializing in traditional and Japanese styles.',
      studioName: 'Ink & Soul Studio',
      website: 'https://inkandsoul.com',
      instagram: '@sarahartist',
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Tattoo Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      hourlyRate: 150.00,
      minPrice: 50.00,
      maxPrice: 500.00,
      isVerified: true,
      isFeatured: true,
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
      verifiedBy: admin.id
    }
  });
  console.log('✅ Artist profile created for:', artist.email);

  // Create specialties
  const specialties = await Promise.all([
    prisma.specialty.upsert({
      where: { name: 'Traditional' },
      update: {},
      create: {
        name: 'Traditional',
        description: 'American Traditional tattoo style',
        icon: 'traditional-icon'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Japanese' },
      update: {},
      create: {
        name: 'Japanese',
        description: 'Japanese Irezumi style',
        icon: 'japanese-icon'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Black & Grey' },
      update: {},
      create: {
        name: 'Black & Grey',
        description: 'Black and grey realism',
        icon: 'black-grey-icon'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Color Realism' },
      update: {},
      create: {
        name: 'Color Realism',
        description: 'Color realistic tattoos',
        icon: 'color-realism-icon'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Neo-Traditional' },
      update: {},
      create: {
        name: 'Neo-Traditional',
        description: 'Modern take on traditional style',
        icon: 'neo-traditional-icon'
      }
    })
  ]);
  console.log('✅ Specialties created:', specialties.length);

  // Create services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { name: 'Custom Design' },
      update: {},
      create: {
        name: 'Custom Design',
        description: 'Custom tattoo design creation',
        price: 100.00,
        duration: 120
      }
    }),
    prisma.service.upsert({
      where: { name: 'Cover-up' },
      update: {},
      create: {
        name: 'Cover-up',
        description: 'Cover-up existing tattoos',
        price: 200.00,
        duration: 180
      }
    }),
    prisma.service.upsert({
      where: { name: 'Touch-up' },
      update: {},
      create: {
        name: 'Touch-up',
        description: 'Touch-up existing tattoos',
        price: 50.00,
        duration: 60
      }
    }),
    prisma.service.upsert({
      where: { name: 'Consultation' },
      update: {},
      create: {
        name: 'Consultation',
        description: 'Initial consultation session',
        price: 25.00,
        duration: 30
      }
    })
  ]);
  console.log('✅ Services created:', services.length);

  // Connect artist to specialties and services
  await prisma.artistProfile.update({
    where: { id: artistProfile.id },
    data: {
      specialties: {
        connect: [
          { name: 'Traditional' },
          { name: 'Japanese' },
          { name: 'Black & Grey' }
        ]
      },
      services: {
        connect: [
          { name: 'Custom Design' },
          { name: 'Cover-up' },
          { name: 'Touch-up' },
          { name: 'Consultation' }
        ]
      }
    }
  });
  console.log('✅ Artist connected to specialties and services');

  // Create some flash items for the artist
  const flashItems = await Promise.all([
    prisma.flash.create({
      data: {
        artistId: artistProfile.id,
        title: 'Traditional Rose',
        description: 'Classic traditional rose design',
        imageUrl: 'https://example.com/flash1.jpg',
        price: 150.00,
        isAvailable: true,
        tags: ['traditional', 'rose', 'flower']
      }
    }),
    prisma.flash.create({
      data: {
        artistId: artistProfile.id,
        title: 'Japanese Dragon',
        description: 'Traditional Japanese dragon design',
        imageUrl: 'https://example.com/flash2.jpg',
        price: 300.00,
        isAvailable: true,
        tags: ['japanese', 'dragon', 'mythical']
      }
    }),
    prisma.flash.create({
      data: {
        artistId: artistProfile.id,
        title: 'Black & Grey Skull',
        description: 'Realistic black and grey skull',
        imageUrl: 'https://example.com/flash3.jpg',
        price: 200.00,
        isAvailable: true,
        tags: ['black-grey', 'skull', 'realism']
      }
    })
  ]);
  console.log('✅ Flash items created:', flashItems.length);

  // Create some reviews (using different authors to avoid unique constraint)
  const reviews = await Promise.all([
    prisma.review.upsert({
      where: {
        authorId_recipientId: {
          authorId: client.id,
          recipientId: artist.id
        }
      },
      update: {
        rating: 5,
        title: 'Amazing work!',
        comment: 'Sarah did an incredible job on my traditional rose tattoo. Highly recommended!',
        isVerified: true,
        isApproved: true
      },
      create: {
        authorId: client.id,
        recipientId: artist.id,
        rating: 5,
        title: 'Amazing work!',
        comment: 'Sarah did an incredible job on my traditional rose tattoo. Highly recommended!',
        isVerified: true,
        isApproved: true
      }
    })
  ]);
  console.log('✅ Reviews created:', reviews.length);

  // Create a pending artist for testing verification
  const pendingArtistPassword = await bcrypt.hash('pending123', 10);
  const pendingArtist = await prisma.user.upsert({
    where: { email: 'pending@example.com' },
    update: {},
    create: {
      email: 'pending@example.com',
      password: pendingArtistPassword,
      firstName: 'Mike',
      lastName: 'Pending',
      role: 'ARTIST',
      isActive: true,
      isVerified: false,
      phone: '+1234567893'
    }
  });

  const pendingArtistProfile = await prisma.artistProfile.upsert({
    where: { userId: pendingArtist.id },
    update: {},
    create: {
      userId: pendingArtist.id,
      bio: 'New artist looking to build portfolio. Specializing in minimalist designs.',
      studioName: 'Minimal Ink Studio',
      website: 'https://minimalink.com',
      instagram: '@mikepending',
      latitude: 40.7589,
      longitude: -73.9851,
      address: '456 Art Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA',
      hourlyRate: 80.00,
      minPrice: 30.00,
      maxPrice: 200.00,
      isVerified: false,
      isFeatured: false,
      verificationStatus: 'PENDING'
    }
  });
  console.log('✅ Pending artist created:', pendingArtist.email);

  // Log some admin actions
  const adminActions = await Promise.all([
    prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: 'VERIFY_ARTIST',
        targetType: 'ARTIST',
        targetId: artistProfile.id,
        details: 'Initial verification of test artist account'
      }
    }),
    prisma.adminAction.create({
      data: {
        adminId: admin.id,
        action: 'FEATURE_ARTIST',
        targetType: 'ARTIST',
        targetId: artistProfile.id,
        details: 'Featured test artist for demonstration'
      }
    })
  ]);
  console.log('✅ Admin actions logged:', adminActions.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin: admin@tattoolocator.com / admin123');
  console.log('Client: client@example.com / client123');
  console.log('Artist: artist@example.com / artist123');
  console.log('Pending Artist: pending@example.com / pending123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 