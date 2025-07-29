const request = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../server')

describe('Artist Endpoints', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  describe('POST /api/artists', () => {
    let testUser
    let authToken

    beforeEach(async () => {
      testUser = await createTestUser({ role: 'ARTIST' })
      authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET)
    })

    it('should create artist profile successfully', async () => {
      const profileData = {
        bio: 'Experienced tattoo artist specializing in traditional and Japanese styles',
        studioName: 'Ink & Soul Studio',
        website: 'https://inkandsoul.com',
        instagram: '@inkandsoul',
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        hourlyRate: 150,
        minPrice: 50,
        maxPrice: 500
      }

      const response = await request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Artist profile created successfully')
      expect(response.body.data.artistProfile).toHaveProperty('id')
      expect(response.body.data.artistProfile.bio).toBe(profileData.bio)
      expect(response.body.data.artistProfile.studioName).toBe(profileData.studioName)
      expect(response.body.data.artistProfile.latitude).toBe(profileData.latitude)
      expect(response.body.data.artistProfile.longitude).toBe(profileData.longitude)

      // Verify profile was created in database
      const profile = await testPrisma.artistProfile.findUnique({
        where: { userId: testUser.id }
      })
      expect(profile).toBeTruthy()
      expect(profile.bio).toBe(profileData.bio)
    })

    it('should return error if user is not an artist', async () => {
      const clientUser = await createTestUser({ role: 'CLIENT' })
      const clientToken = jwt.sign({ id: clientUser.id }, process.env.JWT_SECRET)

      const response = await request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ bio: 'Test bio' })
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access denied. Artist role required.')
    })

    it('should return error if profile already exists', async () => {
      // Create existing profile
      await testPrisma.artistProfile.create({
        data: {
          userId: testUser.id,
          bio: 'Existing bio'
        }
      })

      const response = await request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bio: 'New bio' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Artist profile already exists')
    })

    it('should return error without authentication', async () => {
      const response = await request(app)
        .post('/api/artists')
        .send({ bio: 'Test bio' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/artists', () => {
    let testArtists

    beforeEach(async () => {
      // Create multiple test artists
      testArtists = []
      for (let i = 0; i < 3; i++) {
        const { user, artistProfile } = await createTestArtist({
          email: `artist${i}@example.com`,
          firstName: `Artist${i}`,
          lastName: 'Test'
        })
        testArtists.push({ user, artistProfile })
      }
    })

    it('should get all artists successfully', async () => {
      const response = await request(app)
        .get('/api/artists')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.artists).toBeInstanceOf(Array)
      expect(response.body.data.artists).toHaveLength(3)
      expect(response.body.data.total).toBe(3)
    })

    it('should filter artists by city', async () => {
      // Update one artist's city
      await testPrisma.artistProfile.update({
        where: { id: testArtists[0].artistProfile.id },
        data: { city: 'Los Angeles' }
      })

      const response = await request(app)
        .get('/api/artists?city=Los Angeles')
        .expect(200)

      expect(response.body.data.artists).toHaveLength(1)
      expect(response.body.data.artists[0].city).toBe('Los Angeles')
    })

    it('should filter artists by specialty', async () => {
      // Create specialty and associate with artist
      const specialty = await testPrisma.specialty.create({
        data: { name: 'Traditional', description: 'Traditional tattoo style' }
      })

      await testPrisma.artistProfile.update({
        where: { id: testArtists[0].artistProfile.id },
        data: {
          specialties: {
            connect: { id: specialty.id }
          }
        }
      })

      const response = await request(app)
        .get('/api/artists?specialty=Traditional')
        .expect(200)

      expect(response.body.data.artists).toHaveLength(1)
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/artists?page=1&limit=2')
        .expect(200)

      expect(response.body.data.artists).toHaveLength(2)
      expect(response.body.data.page).toBe(1)
      expect(response.body.data.limit).toBe(2)
      expect(response.body.data.total).toBe(3)
    })

    it('should search artists by name', async () => {
      const response = await request(app)
        .get('/api/artists?search=Artist0')
        .expect(200)

      expect(response.body.data.artists).toHaveLength(1)
      expect(response.body.data.artists[0].user.firstName).toBe('Artist0')
    })
  })

  describe('GET /api/artists/:id', () => {
    let testArtist

    beforeEach(async () => {
      testArtist = await createTestArtist()
    })

    it('should get artist profile by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/artists/${testArtist.artistProfile.id}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.artistProfile).toHaveProperty('id')
      expect(response.body.data.artistProfile.bio).toBe('Test artist bio')
      expect(response.body.data.artistProfile.studioName).toBe('Test Studio')
      expect(response.body.data.user).toHaveProperty('firstName')
      expect(response.body.data.user).toHaveProperty('lastName')
    })

    it('should return error for non-existent artist', async () => {
      const response = await request(app)
        .get('/api/artists/non-existent-id')
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Artist profile not found')
    })

    it('should include specialties and services', async () => {
      // Create specialty and service
      const specialty = await testPrisma.specialty.create({
        data: { name: 'Japanese', description: 'Japanese tattoo style' }
      })
      const service = await testPrisma.service.create({
        data: { name: 'Custom Design', description: 'Custom tattoo design' }
      })

      // Associate with artist
      await testPrisma.artistProfile.update({
        where: { id: testArtist.artistProfile.id },
        data: {
          specialties: { connect: { id: specialty.id } },
          services: { connect: { id: service.id } }
        }
      })

      const response = await request(app)
        .get(`/api/artists/${testArtist.artistProfile.id}`)
        .expect(200)

      expect(response.body.data.artistProfile.specialties).toHaveLength(1)
      expect(response.body.data.artistProfile.services).toHaveLength(1)
      expect(response.body.data.artistProfile.specialties[0].name).toBe('Japanese')
      expect(response.body.data.artistProfile.services[0].name).toBe('Custom Design')
    })
  })

  describe('PUT /api/artists/:id', () => {
    let testArtist
    let authToken

    beforeEach(async () => {
      testArtist = await createTestArtist()
      authToken = jwt.sign({ id: testArtist.user.id }, process.env.JWT_SECRET)
    })

    it('should update artist profile successfully', async () => {
      const updateData = {
        bio: 'Updated bio with more experience',
        studioName: 'Updated Studio Name',
        website: 'https://updatedstudio.com',
        hourlyRate: 200
      }

      const response = await request(app)
        .put(`/api/artists/${testArtist.artistProfile.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Artist profile updated successfully')
      expect(response.body.data.artistProfile.bio).toBe(updateData.bio)
      expect(response.body.data.artistProfile.studioName).toBe(updateData.studioName)
      expect(response.body.data.artistProfile.hourlyRate).toBe(updateData.hourlyRate)

      // Verify database was updated
      const updatedProfile = await testPrisma.artistProfile.findUnique({
        where: { id: testArtist.artistProfile.id }
      })
      expect(updatedProfile.bio).toBe(updateData.bio)
    })

    it('should return error if user is not the profile owner', async () => {
      const otherUser = await createTestUser({ role: 'ARTIST' })
      const otherToken = jwt.sign({ id: otherUser.id }, process.env.JWT_SECRET)

      const response = await request(app)
        .put(`/api/artists/${testArtist.artistProfile.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ bio: 'Unauthorized update' })
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access denied. You can only update your own profile.')
    })

    it('should return error without authentication', async () => {
      const response = await request(app)
        .put(`/api/artists/${testArtist.artistProfile.id}`)
        .send({ bio: 'Test update' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should return error for non-existent profile', async () => {
      const response = await request(app)
        .put('/api/artists/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bio: 'Test update' })
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Artist profile not found')
    })
  })

  describe('GET /api/artists/nearby', () => {
    let testArtists

    beforeEach(async () => {
      // Create artists at different locations
      testArtists = []
      
      // Artist 1: New York (40.7128, -74.0060)
      const artist1 = await createTestArtist({ email: 'artist1@example.com' })
      await testPrisma.artistProfile.update({
        where: { id: artist1.artistProfile.id },
        data: {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York'
        }
      })
      testArtists.push(artist1)

      // Artist 2: Los Angeles (34.0522, -118.2437)
      const artist2 = await createTestArtist({ email: 'artist2@example.com' })
      await testPrisma.artistProfile.update({
        where: { id: artist2.artistProfile.id },
        data: {
          latitude: 34.0522,
          longitude: -118.2437,
          city: 'Los Angeles'
        }
      })
      testArtists.push(artist2)
    })

    it('should find nearby artists', async () => {
      // Search near New York
      const response = await request(app)
        .get('/api/artists/nearby?lat=40.7128&lng=-74.0060&radius=50')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.artists).toHaveLength(1)
      expect(response.body.data.artists[0].city).toBe('New York')
    })

    it('should respect radius parameter', async () => {
      // Search with large radius to include both artists
      const response = await request(app)
        .get('/api/artists/nearby?lat=40.7128&lng=-74.0060&radius=3000')
        .expect(200)

      expect(response.body.data.artists).toHaveLength(2)
    })

    it('should return error without coordinates', async () => {
      const response = await request(app)
        .get('/api/artists/nearby')
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Latitude and longitude are required')
    })
  })
}) 