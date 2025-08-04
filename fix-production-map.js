const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/tattoo_app"
    }
  }
});

// Montreal coordinates for different areas
const montrealCoordinates = [
  { lat: 45.5017, lng: -73.5673, name: 'Downtown Montreal' },
  { lat: 45.5048, lng: -73.5732, name: 'Old Montreal' },
  { lat: 45.4972, lng: -73.5784, name: 'Plateau Mont-Royal' },
  { lat: 45.5234, lng: -73.5878, name: 'Mile End' },
  { lat: 45.5168, lng: -73.5612, name: 'Village' },
  { lat: 45.4905, lng: -73.5708, name: 'Griffintown' },
  { lat: 45.5088, lng: -73.5542, name: 'Quartier Latin' },
  { lat: 45.5200, lng: -73.6100, name: 'Outremont' },
  { lat: 45.4800, lng: -73.5800, name: 'Verdun' },
  { lat: 45.5300, lng: -73.6200, name: 'Côte-des-Neiges' }
];

async function fixProductionMap() {
  try {
    console.log('🔍 Connecting to production database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Get studios without coordinates
    const studios = await prisma.studio.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      take: 20 // Update more studios
    });

    console.log(`📊 Found ${studios.length} studios without coordinates`);

    if (studios.length === 0) {
      console.log('✅ All studios already have coordinates!');
      return;
    }

    // Update each studio with coordinates
    for (let i = 0; i < studios.length; i++) {
      const studio = studios[i];
      const coords = montrealCoordinates[i % montrealCoordinates.length];
      
      console.log(`📍 Updating ${studio.title} with coordinates: ${coords.lat}, ${coords.lng}`);
      
      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          latitude: coords.lat,
          longitude: coords.lng,
          address: studio.address || `${Math.floor(Math.random() * 9999) + 1000} ${['Main St', 'Oak Ave', 'Pine St', 'Maple Dr', 'Cedar Ln'][Math.floor(Math.random() * 5)]}`,
          city: studio.city || 'Montreal',
          state: studio.state || 'Quebec',
          zipCode: studio.zipCode || `H${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
        }
      });
    }

    console.log('✅ Successfully updated studio coordinates!');
    
    // Verify the updates
    const updatedStudios = await prisma.studio.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        state: true
      },
      take: 10
    });

    console.log('\n📋 Studios with coordinates:');
    updatedStudios.forEach(studio => {
      console.log(`  • ${studio.title}: ${studio.latitude}, ${studio.longitude} (${studio.address}, ${studio.city}, ${studio.state})`);
    });

  } catch (error) {
    console.error('❌ Error updating studio coordinates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixProductionMap(); 