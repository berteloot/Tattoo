const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleGalleryItems() {
  try {
    console.log('🔄 Creating sample gallery items...\n');
    
    // Get approved artists
    const artists = await prisma.artistProfile.findMany({
      where: {
        verificationStatus: 'APPROVED'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${artists.length} approved artists`);
    
    if (artists.length === 0) {
      console.log('❌ No approved artists found');
      return;
    }
    
    // Sample gallery items data
    const sampleItems = [
      {
        title: "Traditional Japanese Dragon",
        description: "A stunning traditional Japanese dragon tattoo featuring bold colors and intricate details. This piece represents strength and wisdom.",
        tattooStyle: "Japanese (Irezumi)",
        bodyLocation: "Back",
        tags: ["dragon", "japanese", "traditional", "color"],
        categories: ["mythological", "large-scale"]
      },
      {
        title: "Minimalist Geometric Wolf",
        description: "A modern geometric interpretation of a wolf using clean lines and minimal shading. Perfect for those who appreciate contemporary design.",
        tattooStyle: "Geometric",
        bodyLocation: "Forearm",
        tags: ["wolf", "geometric", "minimalist", "black"],
        categories: ["animals", "modern"]
      },
      {
        title: "Watercolor Rose Sleeve",
        description: "A beautiful watercolor rose sleeve with soft, flowing colors and organic shapes. This piece showcases the artist's mastery of watercolor techniques.",
        tattooStyle: "Watercolor",
        bodyLocation: "Full Sleeve",
        tags: ["rose", "watercolor", "sleeve", "colorful"],
        categories: ["floral", "large-scale"]
      },
      {
        title: "Black & Grey Portrait",
        description: "A realistic black and grey portrait tattoo with exceptional shading and detail work. This piece demonstrates advanced technical skills.",
        tattooStyle: "Realistic",
        bodyLocation: "Chest",
        tags: ["portrait", "realistic", "black-grey", "detailed"],
        categories: ["portraits", "realistic"]
      },
      {
        title: "Neo-Traditional Eagle",
        description: "A neo-traditional eagle design with bold outlines and vibrant colors. This piece combines traditional elements with modern artistic sensibilities.",
        tattooStyle: "Neo-Traditional",
        bodyLocation: "Shoulder",
        tags: ["eagle", "neo-traditional", "color", "bold"],
        categories: ["animals", "traditional"]
      }
    ];
    
    // Create sample items for each artist
    for (let i = 0; i < artists.length && i < sampleItems.length; i++) {
      const artist = artists[i];
      const itemData = sampleItems[i];
      
      console.log(`🎨 Creating item for ${artist.user.firstName} ${artist.user.lastName}: ${itemData.title}`);
      
      const galleryItem = await prisma.tattooGallery.create({
        data: {
          artistId: artist.id,
          title: itemData.title,
          description: itemData.description,
          imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600&fit=crop`,
          imagePublicId: `sample-gallery-${i}`,
          imageWidth: 800,
          imageHeight: 600,
          imageFormat: 'jpg',
          imageBytes: 150000,
          tattooStyle: itemData.tattooStyle,
          bodyLocation: itemData.bodyLocation,
          tags: itemData.tags,
          categories: itemData.categories,
          isApproved: true,
          clientConsent: true,
          sessionCount: Math.floor(Math.random() * 3) + 1,
          hoursSpent: Math.floor(Math.random() * 8) + 2
        }
      });
      
      console.log(`✅ Created gallery item: ${galleryItem.id}`);
    }
    
    // Verify creation
    const totalItems = await prisma.tattooGallery.count();
    console.log(`\n📊 Total gallery items now: ${totalItems}`);
    
    // Check approved items
    const approvedItems = await prisma.tattooGallery.count({
      where: {
        isApproved: true
      }
    });
    console.log(`📊 Approved gallery items: ${approvedItems}`);
    
  } catch (error) {
    console.error('❌ Error creating sample gallery items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleGalleryItems();
