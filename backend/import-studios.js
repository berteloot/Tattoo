const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Your studio data - replace with your actual data
const studioData = [
  {
    title: "Ink Master Studio",
    website: "https://inkmasterstudio.com",
    phoneNumber: "+1234567890",
    email: "contact@inkmasterstudio.com",
    facebookUrl: "https://facebook.com/inkmasterstudio",
    instagramUrl: "https://instagram.com/inkmasterstudio",
    twitterUrl: "https://twitter.com/inkmasterstudio",
    linkedinUrl: "https://linkedin.com/company/inkmasterstudio",
    youtubeUrl: "https://youtube.com/inkmasterstudio"
  },
  {
    title: "Artistic Ink Gallery",
    website: "https://artisticinkgallery.com",
    phoneNumber: "+1234567891",
    email: "info@artisticinkgallery.com",
    facebookUrl: "https://facebook.com/artisticinkgallery",
    instagramUrl: "https://instagram.com/artisticinkgallery",
    twitterUrl: "https://twitter.com/artisticinkgallery",
    linkedinUrl: "https://linkedin.com/company/artisticinkgallery",
    youtubeUrl: "https://youtube.com/artisticinkgallery"
  },
  {
    title: "Tattoo Paradise",
    website: "https://tattooparadise.com",
    phoneNumber: "+1234567892",
    email: "hello@tattooparadise.com",
    facebookUrl: "https://facebook.com/tattooparadise",
    instagramUrl: "https://instagram.com/tattooparadise",
    twitterUrl: "https://twitter.com/tattooparadise",
    linkedinUrl: "https://linkedin.com/company/tattooparadise",
    youtubeUrl: "https://youtube.com/tattooparadise"
  },
  {
    title: "Modern Ink Collective",
    website: "https://moderninkcollective.com",
    phoneNumber: "+1234567893",
    email: "studio@moderninkcollective.com",
    facebookUrl: "https://facebook.com/moderninkcollective",
    instagramUrl: "https://instagram.com/moderninkcollective",
    twitterUrl: "https://twitter.com/moderninkcollective",
    linkedinUrl: "https://linkedin.com/company/moderninkcollective",
    youtubeUrl: "https://youtube.com/moderninkcollective"
  },
  {
    title: "Heritage Tattoo Co",
    website: "https://heritagetattooco.com",
    phoneNumber: "+1234567894",
    email: "info@heritagetattooco.com",
    facebookUrl: "https://facebook.com/heritagetattooco",
    instagramUrl: "https://instagram.com/heritagetattooco",
    twitterUrl: "https://twitter.com/heritagetattooco",
    linkedinUrl: "https://linkedin.com/company/heritagetattooco",
    youtubeUrl: "https://youtube.com/heritagetattooco"
  }
];

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const importStudios = async () => {
  try {
    console.log('Starting studio import...');
    
    for (const studio of studioData) {
      try {
        const existingStudio = await prisma.studio.findUnique({
          where: { slug: createSlug(studio.title) }
        });
        
        if (existingStudio) {
          console.log(`Studio "${studio.title}" already exists, skipping...`);
          continue;
        }
        
        const newStudio = await prisma.studio.create({
          data: {
            title: studio.title,
            slug: createSlug(studio.title),
            website: studio.website || null,
            phoneNumber: studio.phoneNumber || null,
            email: studio.email || null,
            facebookUrl: studio.facebookUrl || null,
            instagramUrl: studio.instagramUrl || null,
            twitterUrl: studio.twitterUrl || null,
            linkedinUrl: studio.linkedinUrl || null,
            youtubeUrl: studio.youtubeUrl || null,
            isActive: true,
            isVerified: false,
            verificationStatus: 'PENDING'
          }
        });
        
        console.log(`✅ Imported studio: ${newStudio.title}`);
      } catch (error) {
        console.error(`❌ Error importing studio "${studio.title}":`, error.message);
      }
    }
    
    console.log('Studio import completed!');
    
    // Show summary
    const totalStudios = await prisma.studio.count();
    console.log(`Total studios in database: ${totalStudios}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Instructions for the user
console.log('📋 Studio Import Instructions:');
console.log('1. Replace the studioData array above with your actual studio information');
console.log('2. Each studio should have: title, website, phoneNumber, email, facebookUrl, instagramUrl, twitterUrl, linkedinUrl, youtubeUrl');
console.log('3. Run this script with: node import-studios.js');
console.log('');

// Run the import
importStudios(); 