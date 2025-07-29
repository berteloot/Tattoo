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
      latitude: 45.5017,
      longitude: -73.5673,
      address: '123 Saint Catherine Street',
      city: 'Montreal',
      state: 'Quebec',
      zipCode: 'H2X 1K4',
      country: 'Canada',
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

  // Create additional artists for better map demonstration
  const additionalArtists = await Promise.all([
    // Lisa Tanaka - Japanese specialist
    prisma.user.upsert({
      where: { email: 'lisa@example.com' },
      update: {},
      create: {
        email: 'lisa@example.com',
        password: await bcrypt.hash('artist123', 10),
        firstName: 'Lisa',
        lastName: 'Tanaka',
        role: 'ARTIST',
        isActive: true,
        isVerified: true,
        phone: '+1234567894'
      }
    }),
    // David Kim - Black & Grey specialist
    prisma.user.upsert({
      where: { email: 'david@example.com' },
      update: {},
      create: {
        email: 'david@example.com',
        password: await bcrypt.hash('artist123', 10),
        firstName: 'David',
        lastName: 'Kim',
        role: 'ARTIST',
        isActive: true,
        isVerified: true,
        phone: '+1234567895'
      }
    }),
    // Emma Thompson - Minimalist specialist
    prisma.user.upsert({
      where: { email: 'emma@example.com' },
      update: {},
      create: {
        email: 'emma@example.com',
        password: await bcrypt.hash('artist123', 10),
        firstName: 'Emma',
        lastName: 'Thompson',
        role: 'ARTIST',
        isActive: true,
        isVerified: true,
        phone: '+1234567896'
      }
    }),
    // Marcus Rodriguez - Color Realism specialist
    prisma.user.upsert({
      where: { email: 'marcus@example.com' },
      update: {},
      create: {
        email: 'marcus@example.com',
        password: await bcrypt.hash('artist123', 10),
        firstName: 'Marcus',
        lastName: 'Rodriguez',
        role: 'ARTIST',
        isActive: true,
        isVerified: true,
        phone: '+1234567897'
      }
    })
  ]);

  // Create artist profiles for additional artists
  const additionalArtistProfiles = await Promise.all([
    prisma.artistProfile.upsert({
      where: { userId: additionalArtists[0].id },
      update: {},
      create: {
        userId: additionalArtists[0].id,
        bio: 'Japanese tattoo specialist with deep knowledge of traditional Irezumi techniques.',
        studioName: 'Dragon\'s Den Tattoo',
        website: 'https://dragonsden.com',
        instagram: '@lisatanaka',
        latitude: 45.5088,
        longitude: -73.5617,
        address: '456 Sherbrooke Street',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H3A 1E7',
        country: 'Canada',
        hourlyRate: 180.00,
        minPrice: 80.00,
        maxPrice: 600.00,
        isVerified: true,
        isFeatured: true,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        verifiedBy: admin.id
      }
    }),
    prisma.artistProfile.upsert({
      where: { userId: additionalArtists[1].id },
      update: {},
      create: {
        userId: additionalArtists[1].id,
        bio: 'Master of black and grey realism, creating stunning portraits and detailed artwork.',
        studioName: 'Color Flow Tattoo',
        website: 'https://colorflow.com',
        instagram: '@davidkim',
        latitude: 45.5048,
        longitude: -73.5732,
        address: '789 Peel Street',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H3C 2G8',
        country: 'Canada',
        hourlyRate: 200.00,
        minPrice: 100.00,
        maxPrice: 800.00,
        isVerified: true,
        isFeatured: false,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        verifiedBy: admin.id
      }
    }),
    prisma.artistProfile.upsert({
      where: { userId: additionalArtists[2].id },
      update: {},
      create: {
        userId: additionalArtists[2].id,
        bio: 'Minimalist tattoo specialist creating elegant, simple designs that speak volumes.',
        studioName: 'Simple Lines Studio',
        website: 'https://simplelines.com',
        instagram: '@emmathompson',
        latitude: 45.4972,
        longitude: -73.5784,
        address: '321 Crescent Street',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H3G 2B1',
        country: 'Canada',
        hourlyRate: 120.00,
        minPrice: 60.00,
        maxPrice: 400.00,
        isVerified: true,
        isFeatured: false,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        verifiedBy: admin.id
      }
    }),
    prisma.artistProfile.upsert({
      where: { userId: additionalArtists[3].id },
      update: {},
      create: {
        userId: additionalArtists[3].id,
        bio: 'Color realism expert specializing in vibrant, lifelike portraits and nature scenes.',
        studioName: 'Black Canvas Tattoo',
        website: 'https://blackcanvas.com',
        instagram: '@marcusrodriguez',
        latitude: 45.5122,
        longitude: -73.5544,
        address: '654 Saint Denis Street',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H2S 2S3',
        country: 'Canada',
        hourlyRate: 160.00,
        minPrice: 75.00,
        maxPrice: 500.00,
        isVerified: true,
        isFeatured: false,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        verifiedBy: admin.id
      }
    })
  ]);

  console.log('✅ Additional artists created:', additionalArtists.length);

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

  // Connect additional artists to specialties and services
  await Promise.all([
    // Lisa Tanaka - Japanese specialist
    prisma.artistProfile.update({
      where: { id: additionalArtistProfiles[0].id },
      data: {
        specialties: {
          connect: [
            { name: 'Japanese' },
            { name: 'Traditional' }
          ]
        },
        services: {
          connect: [
            { name: 'Custom Design' },
            { name: 'Consultation' }
          ]
        }
      }
    }),
    // David Kim - Black & Grey specialist
    prisma.artistProfile.update({
      where: { id: additionalArtistProfiles[1].id },
      data: {
        specialties: {
          connect: [
            { name: 'Black & Grey' },
            { name: 'Color Realism' }
          ]
        },
        services: {
          connect: [
            { name: 'Custom Design' },
            { name: 'Cover-up' },
            { name: 'Touch-up' }
          ]
        }
      }
    }),
    // Emma Thompson - Minimalist specialist
    prisma.artistProfile.update({
      where: { id: additionalArtistProfiles[2].id },
      data: {
        specialties: {
          connect: [
            { name: 'Neo-Traditional' }
          ]
        },
        services: {
          connect: [
            { name: 'Custom Design' },
            { name: 'Consultation' }
          ]
        }
      }
    }),
    // Marcus Rodriguez - Color Realism specialist
    prisma.artistProfile.update({
      where: { id: additionalArtistProfiles[3].id },
      data: {
        specialties: {
          connect: [
            { name: 'Color Realism' },
            { name: 'Black & Grey' }
          ]
        },
        services: {
          connect: [
            { name: 'Custom Design' },
            { name: 'Cover-up' },
            { name: 'Touch-up' }
          ]
        }
      }
    })
  ]);
  console.log('✅ Additional artists connected to specialties and services');

  // Create flash items
  console.log('🌱 Creating flash items...')

  const flashItems = [
    {
      title: 'Traditional Rose',
      description: 'Classic American traditional rose design with bold colors and clean lines.',
      imageUrl: 'https://images.unsplash.com/photo-1611657365908-2c9162724b1c?w=400&h=400&fit=crop',
      price: 150,
      tags: ['Traditional', 'Rose', 'Color'],
      isAvailable: true
    },
    {
      title: 'Japanese Dragon',
      description: 'Traditional Japanese Irezumi dragon design with intricate details.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 300,
      tags: ['Japanese', 'Dragon', 'Traditional'],
      isAvailable: true
    },
    {
      title: 'Minimalist Arrow',
      description: 'Simple and elegant arrow design perfect for first-time clients.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 80,
      tags: ['Minimalist', 'Arrow', 'Simple'],
      isAvailable: true
    },
    {
      title: 'Watercolor Butterfly',
      description: 'Beautiful watercolor-style butterfly with soft, flowing colors.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 200,
      tags: ['Watercolor', 'Butterfly', 'Colorful'],
      isAvailable: true
    },
    {
      title: 'Black & Grey Skull',
      description: 'Detailed black and grey skull design with realistic shading.',
      imageUrl: 'https://images.unsplash.com/photo-1611657365908-2c9162724b1c?w=400&h=400&fit=crop',
      price: 180,
      tags: ['Black & Grey', 'Skull', 'Realistic'],
      isAvailable: true
    },
    {
      title: 'Neo-Traditional Wolf',
      description: 'Modern take on traditional wolf design with vibrant colors.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 250,
      tags: ['Neo-Traditional', 'Wolf', 'Colorful'],
      isAvailable: true
    },
    {
      title: 'Geometric Compass',
      description: 'Clean geometric compass design with precise lines.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 120,
      tags: ['Geometric', 'Compass', 'Precision'],
      isAvailable: true
    },
    {
      title: 'Floral Mandala',
      description: 'Intricate floral mandala design with symmetrical patterns.',
      imageUrl: 'https://images.unsplash.com/photo-1611657365908-2c9162724b1c?w=400&h=400&fit=crop',
      price: 280,
      tags: ['Mandala', 'Floral', 'Symmetrical'],
      isAvailable: true
    },
    {
      title: 'Tribal Sun',
      description: 'Bold tribal sun design with strong black lines.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 160,
      tags: ['Tribal', 'Sun', 'Bold'],
      isAvailable: true
    },
    {
      title: 'Realistic Portrait',
      description: 'Detailed realistic portrait tattoo with fine shading.',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 400,
      tags: ['Realistic', 'Portrait', 'Detailed'],
      isAvailable: true
    },
    {
      title: 'Abstract Wave',
      description: 'Modern abstract wave design with flowing lines.',
      imageUrl: 'https://images.unsplash.com/photo-1611657365908-2c9162724b1c?w=400&h=400&fit=crop',
      price: 140,
      tags: ['Abstract', 'Wave', 'Modern'],
      isAvailable: true
    },
    {
      title: 'Vintage Anchor',
      description: 'Classic vintage anchor design with aged appearance.',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 130,
      tags: ['Vintage', 'Anchor', 'Classic'],
      isAvailable: true
    }
  ]

  // Create flash items for all artists
  console.log('🌱 Creating flash items...')
  
  // Get all artist profiles to distribute flash items
  const allArtistProfiles = [artistProfile, ...additionalArtistProfiles]
  
  const createdFlashItems = await Promise.all(
    flashItems.map(async (flashItem, index) => {
      // Distribute flash items among different artists
      const artistIndex = index % allArtistProfiles.length
      const artistProfile = allArtistProfiles[artistIndex]
      
      return prisma.flash.create({
        data: {
          artistId: artistProfile.id,
          title: flashItem.title,
          description: flashItem.description,
          imageUrl: flashItem.imageUrl,
          price: flashItem.price,
          tags: flashItem.tags,
          isAvailable: flashItem.isAvailable
        }
      })
    })
  )
  
  console.log('✅ Flash items created:', createdFlashItems.length)

  // Create some reviews for all artists
  const reviews = await Promise.all([
    // Sarah Artist review
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
    }),
    // Lisa Tanaka review
    prisma.review.upsert({
      where: {
        authorId_recipientId: {
          authorId: client.id,
          recipientId: additionalArtists[0].id
        }
      },
      update: {
        rating: 5,
        title: 'Beautiful Japanese work!',
        comment: 'Lisa\'s Japanese dragon tattoo is absolutely stunning. Perfect attention to detail.',
        isVerified: true,
        isApproved: true
      },
      create: {
        authorId: client.id,
        recipientId: additionalArtists[0].id,
        rating: 5,
        title: 'Beautiful Japanese work!',
        comment: 'Lisa\'s Japanese dragon tattoo is absolutely stunning. Perfect attention to detail.',
        isVerified: true,
        isApproved: true
      }
    }),
    // David Kim review
    prisma.review.upsert({
      where: {
        authorId_recipientId: {
          authorId: client.id,
          recipientId: additionalArtists[1].id
        }
      },
      update: {
        rating: 4,
        title: 'Great black and grey work',
        comment: 'David\'s black and grey portrait work is exceptional. Very professional.',
        isVerified: true,
        isApproved: true
      },
      create: {
        authorId: client.id,
        recipientId: additionalArtists[1].id,
        rating: 4,
        title: 'Great black and grey work',
        comment: 'David\'s black and grey portrait work is exceptional. Very professional.',
        isVerified: true,
        isApproved: true
      }
    }),
    // Emma Thompson review
    prisma.review.upsert({
      where: {
        authorId_recipientId: {
          authorId: client.id,
          recipientId: additionalArtists[2].id
        }
      },
      update: {
        rating: 5,
        title: 'Perfect minimalist design',
        comment: 'Emma created the perfect minimalist tattoo for me. Clean lines and beautiful execution.',
        isVerified: true,
        isApproved: true
      },
      create: {
        authorId: client.id,
        recipientId: additionalArtists[2].id,
        rating: 5,
        title: 'Perfect minimalist design',
        comment: 'Emma created the perfect minimalist tattoo for me. Clean lines and beautiful execution.',
        isVerified: true,
        isApproved: true
      }
    }),
    // Marcus Rodriguez review
    prisma.review.upsert({
      where: {
        authorId_recipientId: {
          authorId: client.id,
          recipientId: additionalArtists[3].id
        }
      },
      update: {
        rating: 4,
        title: 'Vibrant color work',
        comment: 'Marcus did an amazing job with my color realism tattoo. The colors are so vibrant!',
        isVerified: true,
        isApproved: true
      },
      create: {
        authorId: client.id,
        recipientId: additionalArtists[3].id,
        rating: 4,
        title: 'Vibrant color work',
        comment: 'Marcus did an amazing job with my color realism tattoo. The colors are so vibrant!',
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
      latitude: 45.5152,
      longitude: -73.5624,
      address: '456 Art Street',
      city: 'Montreal',
      state: 'Quebec',
      zipCode: 'H2V 1A1',
      country: 'Canada',
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