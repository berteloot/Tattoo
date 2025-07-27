const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create specialties
  const specialties = await Promise.all([
    prisma.specialty.upsert({
      where: { name: 'Traditional' },
      update: {},
      create: {
        name: 'Traditional',
        description: 'Classic American traditional tattoo style',
        icon: '🎨'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Japanese' },
      update: {},
      create: {
        name: 'Japanese',
        description: 'Traditional Japanese Irezumi style',
        icon: '🐉'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Black & Grey' },
      update: {},
      create: {
        name: 'Black & Grey',
        description: 'Realistic black and grey tattoos',
        icon: '⚫'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Neo-Traditional' },
      update: {},
      create: {
        name: 'Neo-Traditional',
        description: 'Modern take on traditional styles',
        icon: '🌟'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Minimalist' },
      update: {},
      create: {
        name: 'Minimalist',
        description: 'Simple, clean line work',
        icon: '📐'
      }
    }),
    prisma.specialty.upsert({
      where: { name: 'Watercolor' },
      update: {},
      create: {
        name: 'Watercolor',
        description: 'Soft, painterly tattoo style',
        icon: '🎨'
      }
    })
  ]);

  console.log('✅ Specialties created');

  // Create services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { name: 'Custom Design' },
      update: {},
      create: {
        name: 'Custom Design',
        description: 'Original artwork designed specifically for you',
        price: 150,
        duration: 120
      }
    }),
    prisma.service.upsert({
      where: { name: 'Cover-up' },
      update: {},
      create: {
        name: 'Cover-up',
        description: 'Transform existing tattoos',
        price: 200,
        duration: 180
      }
    }),
    prisma.service.upsert({
      where: { name: 'Touch-up' },
      update: {},
      create: {
        name: 'Touch-up',
        description: 'Refresh and enhance existing tattoos',
        price: 80,
        duration: 60
      }
    }),
    prisma.service.upsert({
      where: { name: 'Flash' },
      update: {},
      create: {
        name: 'Flash',
        description: 'Pre-designed artwork from our collection',
        price: 100,
        duration: 90
      }
    })
  ]);

  console.log('✅ Services created');

  // Create demo artists
  const demoArtists = [
    {
      user: {
        email: 'sarah.traditional@example.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Chen',
        role: 'ARTIST',
        phone: '+1-514-555-0101'
      },
      profile: {
        bio: 'Award-winning traditional tattoo artist with 8 years of experience. Specializing in classic American traditional and Japanese styles. Located in the heart of Montreal\'s Plateau district.',
        studioName: 'Ink & Soul Studio',
        website: 'https://inkandsoulmontreal.com',
        instagram: '@sarahchen_tattoos',
        address: '456 St-Laurent Blvd',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H2W 1Z1',
        country: 'Canada',
        latitude: 45.5155,
        longitude: -73.5703,
        hourlyRate: 120,
        minPrice: 80,
        maxPrice: 300,
        isVerified: true
      },
      specialties: ['Traditional', 'Japanese'],
      services: ['Custom Design', 'Cover-up', 'Flash']
    },
    {
      user: {
        email: 'marcus.blackgrey@example.com',
        password: 'password123',
        firstName: 'Marcus',
        lastName: 'Rodriguez',
        role: 'ARTIST',
        phone: '+1-514-555-0102'
      },
      profile: {
        bio: 'Master of black and grey realism. Creating stunning portraits and detailed artwork that tells your story. Based in Old Montreal with a focus on custom pieces.',
        studioName: 'Black Canvas Tattoo',
        website: 'https://blackcanvasmtl.com',
        instagram: '@marcus_blackgrey',
        address: '789 Notre-Dame St W',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H3C 1K9',
        country: 'Canada',
        latitude: 45.5017,
        longitude: -73.5673,
        hourlyRate: 150,
        minPrice: 100,
        maxPrice: 500,
        isVerified: true
      },
      specialties: ['Black & Grey'],
      services: ['Custom Design', 'Cover-up', 'Touch-up']
    },
    {
      user: {
        email: 'emma.minimalist@example.com',
        password: 'password123',
        firstName: 'Emma',
        lastName: 'Thompson',
        role: 'ARTIST',
        phone: '+1-514-555-0103'
      },
      profile: {
        bio: 'Minimalist tattoo specialist creating elegant, simple designs that speak volumes. Perfect for first-time clients and those who appreciate clean, meaningful artwork.',
        studioName: 'Simple Lines Studio',
        website: 'https://simplelinesmtl.com',
        instagram: '@emma_minimalist',
        address: '321 Sherbrooke St W',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H3A 1E7',
        country: 'Canada',
        latitude: 45.5048,
        longitude: -73.5772,
        hourlyRate: 100,
        minPrice: 60,
        maxPrice: 200,
        isVerified: true
      },
      specialties: ['Minimalist', 'Neo-Traditional'],
      services: ['Custom Design', 'Flash']
    },
    {
      user: {
        email: 'david.watercolor@example.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Kim',
        role: 'ARTIST',
        phone: '+1-514-555-0104'
      },
      profile: {
        bio: 'Watercolor tattoo artist bringing paintings to life on skin. Specializing in vibrant, flowing designs that look like they were painted with watercolors.',
        studioName: 'Color Flow Tattoo',
        website: 'https://colorflowmtl.com',
        instagram: '@david_watercolor',
        address: '654 St-Catherine St W',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H3B 1B8',
        country: 'Canada',
        latitude: 45.5017,
        longitude: -73.5673,
        hourlyRate: 130,
        minPrice: 90,
        maxPrice: 400,
        isVerified: true
      },
      specialties: ['Watercolor', 'Neo-Traditional'],
      services: ['Custom Design', 'Cover-up']
    },
    {
      user: {
        email: 'lisa.japanese@example.com',
        password: 'password123',
        firstName: 'Lisa',
        lastName: 'Tanaka',
        role: 'ARTIST',
        phone: '+1-514-555-0105'
      },
      profile: {
        bio: 'Japanese tattoo specialist trained in traditional Irezumi techniques. Creating authentic Japanese-style tattoos with deep cultural respect and modern precision.',
        studioName: 'Dragon\'s Den Tattoo',
        website: 'https://dragonsdenmtl.com',
        instagram: '@lisa_japanese',
        address: '987 St-Denis St',
        city: 'Montreal',
        state: 'Quebec',
        zipCode: 'H2X 3K4',
        country: 'Canada',
        latitude: 45.5155,
        longitude: -73.5703,
        hourlyRate: 140,
        minPrice: 120,
        maxPrice: 600,
        isVerified: true
      },
      specialties: ['Japanese', 'Traditional'],
      services: ['Custom Design', 'Cover-up', 'Touch-up']
    }
  ];

  // Create artists and their profiles
  for (const artistData of demoArtists) {
    const hashedPassword = await bcrypt.hash(artistData.user.password, 10);
    
    const user = await prisma.user.upsert({
      where: { email: artistData.user.email },
      update: {},
      create: {
        ...artistData.user,
        password: hashedPassword
      }
    });

    const artistProfile = await prisma.artistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...artistData.profile
      }
    });

    // Connect specialties
    for (const specialtyName of artistData.specialties) {
      const specialty = await prisma.specialty.findUnique({
        where: { name: specialtyName }
      });
      if (specialty) {
        await prisma.artistProfile.update({
          where: { id: artistProfile.id },
          data: {
            specialties: {
              connect: { id: specialty.id }
            }
          }
        });
      }
    }

    // Connect services
    for (const serviceName of artistData.services) {
      const service = await prisma.service.findUnique({
        where: { name: serviceName }
      });
      if (service) {
        await prisma.artistProfile.update({
          where: { id: artistProfile.id },
          data: {
            services: {
              connect: { id: service.id }
            }
          }
        });
      }
    }

    console.log(`✅ Created artist: ${user.firstName} ${user.lastName}`);
  }

  // Create some demo flash items
  const flashItems = [
    {
      artistId: (await prisma.artistProfile.findFirst({ where: { studioName: 'Ink & Soul Studio' } })).id,
      title: 'Traditional Rose',
      description: 'Classic red rose with green leaves',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 120,
      tags: ['traditional', 'rose', 'red']
    },
    {
      artistId: (await prisma.artistProfile.findFirst({ where: { studioName: 'Black Canvas Tattoo' } })).id,
      title: 'Portrait Sketch',
      description: 'Realistic black and grey portrait',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 300,
      tags: ['portrait', 'black-grey', 'realistic']
    },
    {
      artistId: (await prisma.artistProfile.findFirst({ where: { studioName: 'Simple Lines Studio' } })).id,
      title: 'Minimalist Mountain',
      description: 'Simple line art mountain range',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      price: 80,
      tags: ['minimalist', 'mountain', 'nature']
    }
  ];

  for (const flashData of flashItems) {
    await prisma.flash.create({
      data: flashData
    });
  }

  console.log('✅ Flash items created');

  // Create some demo reviews
  const reviews = [
    {
      authorId: (await prisma.user.findFirst({ where: { email: 'sarah.traditional@example.com' } })).id,
      recipientId: (await prisma.user.findFirst({ where: { email: 'marcus.blackgrey@example.com' } })).id,
      rating: 5,
      title: 'Amazing portrait work!',
      comment: 'Marcus did an incredible job on my portrait tattoo. The detail is unbelievable and it healed perfectly.',
      isVerified: true
    },
    {
      authorId: (await prisma.user.findFirst({ where: { email: 'marcus.blackgrey@example.com' } })).id,
      recipientId: (await prisma.user.findFirst({ where: { email: 'emma.minimalist@example.com' } })).id,
      rating: 5,
      title: 'Perfect first tattoo experience',
      comment: 'Emma made my first tattoo experience so comfortable. Her minimalist style is exactly what I wanted.',
      isVerified: true
    }
  ];

  for (const reviewData of reviews) {
    await prisma.review.create({
      data: reviewData
    });
  }

  console.log('✅ Reviews created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 