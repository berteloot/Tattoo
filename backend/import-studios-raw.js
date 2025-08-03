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
    console.log('Starting studio import using raw SQL...');
    
    for (const studio of studioData) {
      try {
        const slug = createSlug(studio.title);
        
        // Check if studio already exists
        const existingStudio = await prisma.$queryRaw`
          SELECT id FROM studios WHERE slug = ${slug}
        `;
        
        if (existingStudio && existingStudio.length > 0) {
          console.log(`Studio "${studio.title}" already exists, skipping...`);
          continue;
        }
        
        // Insert new studio using raw SQL
        const result = await prisma.$executeRaw`
          INSERT INTO studios (
            id, title, slug, website, phone_number, email, 
            facebook_url, instagram_url, twitter_url, linkedin_url, youtube_url,
            is_active, is_verified, verification_status, created_at, updated_at
          ) VALUES (
            gen_random_uuid()::text, ${studio.title}, ${slug}, ${studio.website}, 
            ${studio.phoneNumber}, ${studio.email}, ${studio.facebookUrl}, 
            ${studio.instagramUrl}, ${studio.twitterUrl}, ${studio.linkedinUrl}, 
            ${studio.youtubeUrl}, true, false, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `;
        
        console.log(`✅ Imported studio: ${studio.title}`);
      } catch (error) {
        console.error(`❌ Error importing studio "${studio.title}":`, error.message);
      }
    }
    
    console.log('Studio import completed!');
    
    // Show summary using raw SQL
    const totalStudios = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM studios
    `;
    console.log(`Total studios in database: ${totalStudios[0].count}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the import
importStudios(); 