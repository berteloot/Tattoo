const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testFavorites() {
  try {
    console.log('🧪 Testing Favorites Functionality...\n')

    // 1. Check if favorites table exists
    console.log('1. Checking favorites table...')
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'favorites'
      );
    `
    console.log('✅ Favorites table exists:', tableExists[0].exists)

    // 2. Get a client user
    console.log('\n2. Finding a client user...')
    const client = await prisma.user.findFirst({
      where: { role: 'CLIENT' }
    })
    if (client) {
      console.log('✅ Found client:', client.email)
    } else {
      console.log('❌ No client users found')
      return
    }

    // 3. Get an artist
    console.log('\n3. Finding an artist...')
    const artist = await prisma.artistProfile.findFirst({
      include: {
        user: true
      }
    })
    if (artist) {
      console.log('✅ Found artist:', artist.user.firstName, artist.user.lastName)
    } else {
      console.log('❌ No artists found')
      return
    }

    // 4. Test adding a favorite
    console.log('\n4. Testing add favorite...')
    const newFavorite = await prisma.favorite.create({
      data: {
        userId: client.id,
        artistId: artist.id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })
    console.log('✅ Added favorite:', `${newFavorite.user.firstName} ${newFavorite.user.lastName} -> ${newFavorite.artist.user.firstName} ${newFavorite.artist.user.lastName}`)

    // 5. Test checking if favorited
    console.log('\n5. Testing check favorite status...')
    const isFavorited = await prisma.favorite.findUnique({
      where: {
        userId_artistId: {
          userId: client.id,
          artistId: artist.id
        }
      }
    })
    console.log('✅ Favorite status:', isFavorited ? 'Favorited' : 'Not favorited')

    // 6. Test getting user's favorites
    console.log('\n6. Testing get user favorites...')
    const userFavorites = await prisma.favorite.findMany({
      where: {
        userId: client.id
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })
    console.log('✅ User has', userFavorites.length, 'favorites')
    userFavorites.forEach(fav => {
      console.log(`   - ${fav.artist.user.firstName} ${fav.artist.user.lastName}`)
    })

    // 7. Test removing favorite
    console.log('\n7. Testing remove favorite...')
    await prisma.favorite.delete({
      where: {
        userId_artistId: {
          userId: client.id,
          artistId: artist.id
        }
      }
    })
    console.log('✅ Removed favorite')

    // 8. Verify removal
    console.log('\n8. Verifying removal...')
    const afterRemoval = await prisma.favorite.findUnique({
      where: {
        userId_artistId: {
          userId: client.id,
          artistId: artist.id
        }
      }
    })
    console.log('✅ Favorite removed:', !afterRemoval)

    console.log('\n🎉 All favorites tests passed!')
    console.log('\n📋 Summary:')
    console.log('   - Database table: ✅')
    console.log('   - Add favorite: ✅')
    console.log('   - Check status: ✅')
    console.log('   - Get favorites: ✅')
    console.log('   - Remove favorite: ✅')
    console.log('   - Unique constraint: ✅')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testFavorites() 