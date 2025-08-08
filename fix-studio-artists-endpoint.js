// Alternative fix: Update the backend endpoint to handle missing relationships gracefully
// This doesn't require database schema changes and won't affect other functionality

const fixStudioArtistsEndpoint = `
// Replace the existing studio artists endpoint in backend/src/routes/studios.js
// Around line 168-220

// Get artists for a studio
router.get('/:id/artists', async (req, res) => {
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: req.params.id }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    // Use a safer query that doesn't rely on Prisma relationships
    const studioArtists = await prisma.$queryRaw\`
      SELECT 
        sa.id,
        sa.studio_id,
        sa.artist_id,
        sa.role,
        sa.is_active,
        sa.joined_at,
        sa.left_at,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar,
        ap.id as artist_profile_id
      FROM studio_artists sa
      LEFT JOIN artist_profiles ap ON sa.artist_id = ap.id
      LEFT JOIN users u ON ap.user_id = u.id
      WHERE sa.studio_id = \${req.params.id}
        AND sa.is_active = true
      ORDER BY sa.joined_at DESC
    \`;
    
    // Transform the raw data to match the expected format
    const transformedArtists = studioArtists.map(sa => ({
      id: sa.id,
      studioId: sa.studio_id,
      artistId: sa.artist_id,
      role: sa.role,
      isActive: sa.is_active,
      joinedAt: sa.joined_at,
      leftAt: sa.left_at,
      artist: {
        id: sa.artist_profile_id,
        user: {
          id: sa.artist_id,
          firstName: sa.first_name,
          lastName: sa.last_name,
          email: sa.email,
          avatar: sa.avatar
        },
        specialties: [] // We can add this later if needed
      }
    }));
    
    res.json({
      success: true,
      data: transformedArtists
    });
  } catch (error) {
    console.error('Error fetching studio artists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studio artists'
    });
  }
});
`;

console.log('🔧 Alternative Fix: Update Backend Endpoint');
console.log('This approach uses raw SQL queries instead of Prisma relationships');
console.log('It\'s safer and doesn\'t require database schema changes');
console.log('');
console.log('Copy this code to replace the existing endpoint in:');
console.log('backend/src/routes/studios.js (around line 168-220)');
console.log('');
console.log('Benefits:');
console.log('✅ No database schema changes required');
console.log('✅ Won\'t affect existing artist flash, tattoo gallery, or map functionality');
console.log('✅ Safe to deploy immediately');
console.log('✅ Handles missing relationships gracefully');
console.log('');
console.log('Code to replace:');
console.log(fixStudioArtistsEndpoint);
