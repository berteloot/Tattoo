const request = require('supertest')
const app = require('../server')

describe('Review Endpoints', () => {
  let clientUser, artistUser, clientToken, artistToken

  beforeEach(async () => {
    await cleanDatabase()
    
    // Create test users
    clientUser = await createTestUser({
      email: 'client@example.com',
      role: 'CLIENT'
    })
    
    artistUser = await createTestUser({
      email: 'artist@example.com',
      role: 'ARTIST'
    })
    
    // Create artist profile
    await testPrisma.artistProfile.create({
      data: {
        userId: artistUser.id,
        bio: 'Test artist bio',
        studioName: 'Test Studio',
        city: 'Test City',
        state: 'Test State'
      }
    })
    
    // Get auth tokens
    const clientLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'client@example.com',
        password: 'password123'
      })
    clientToken = clientLogin.body.data.token
    
    const artistLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'artist@example.com',
        password: 'password123'
      })
    artistToken = artistLogin.body.data.token
  })

  describe('POST /api/reviews', () => {
    it('should create a review successfully with title and comment', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Amazing experience',
        comment: 'She is a great tattoo artist and very professional.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review).toHaveProperty('id')
      expect(response.body.data.review.rating).toBe(5)
      expect(response.body.data.review.title).toBe('Amazing experience')
      expect(response.body.data.review.comment).toBe('She is a great tattoo artist and very professional.')
      expect(response.body.data.review.authorId).toBe(clientUser.id)
      expect(response.body.data.review.recipientId).toBe(artistUser.id)
    })

    it('should create a review successfully with only title', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 4,
        title: 'Great work',
        comment: ''
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.title).toBe('Great work')
      expect(response.body.data.review.comment).toBeNull()
    })

    it('should create a review successfully with only comment', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 3,
        title: '',
        comment: 'Good experience overall, would recommend to others.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.title).toBeNull()
      expect(response.body.data.review.comment).toBe('Good experience overall, would recommend to others.')
    })

    it('should create a review with images (base64)', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Beautiful work',
        comment: 'The tattoo turned out exactly as I wanted.',
        images: [
          'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
        ]
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.images).toHaveLength(1)
      expect(response.body.data.review.images[0]).toMatch(/^data:image\/jpeg;base64,/)
    })

    it('should create a review with images (URLs)', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 4,
        title: 'Nice work',
        comment: 'Happy with the result.',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.png'
        ]
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.images).toHaveLength(2)
      expect(response.body.data.review.images[0]).toBe('https://example.com/image1.jpg')
    })

    it('should reject review without rating', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        title: 'Amazing experience',
        comment: 'She is a great tattoo artist.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
      expect(response.body.details).toBeDefined()
    })

    it('should reject review without title and comment', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })

    it('should reject review with invalid rating', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 6,
        title: 'Test',
        comment: 'Test comment for validation.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })

    it('should reject review with title too short', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Hi',
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })

    it('should reject review with comment too short', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Great experience',
        comment: 'Short'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })

    it('should accept review with apostrophes and quotes in title', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: "She's a great artist!",
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.title).toBe("She's a great artist!")
    })

    it('should accept review with apostrophes and quotes in comment', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Great work',
        comment: "She's amazing! The tattoo turned out exactly as I wanted. Don't miss this artist!"
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.review.comment).toBe("She's amazing! The tattoo turned out exactly as I wanted. Don't miss this artist!")
    })

    it('should reject review with invalid characters in title', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Test <script>alert("xss")</script>',
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })

    it('should reject review with invalid image format', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Test review',
        comment: 'This is a longer comment that meets the minimum requirement.',
        images: ['invalid-image-format']
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })

    it('should reject review from unauthenticated user', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Test review',
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .send(reviewData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not authorized, no token')
    })

    it('should reject review from artist to another artist', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'Test review',
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${artistToken}`)
        .send(reviewData)
        .expect(403)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access denied')
    })

    it('should reject self-review', async () => {
      const reviewData = {
        recipientId: clientUser.id,
        rating: 5,
        title: 'Test review',
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('You cannot review yourself')
    })

    it('should reject duplicate review from same user', async () => {
      const reviewData = {
        recipientId: artistUser.id,
        rating: 5,
        title: 'First review',
        comment: 'This is my first review for this artist.'
      }

      // Submit first review
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(201)

      // Try to submit second review
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('You have already reviewed this artist')
    })

    it('should reject review for non-artist user', async () => {
      const nonArtistUser = await createTestUser({
        email: 'nonartist@example.com',
        role: 'CLIENT'
      })

      const reviewData = {
        recipientId: nonArtistUser.id,
        rating: 5,
        title: 'Test review',
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Can only review artists')
    })

    it('should reject review for non-existent user', async () => {
      const reviewData = {
        recipientId: 'non-existent-id',
        rating: 5,
        title: 'Test review',
        comment: 'This is a longer comment that meets the minimum requirement.'
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(reviewData)
        .expect(404)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Recipient not found')
    })
  })

  describe('GET /api/reviews', () => {
    beforeEach(async () => {
      // Create some test reviews
      await testPrisma.review.createMany({
        data: [
          {
            authorId: clientUser.id,
            recipientId: artistUser.id,
            rating: 5,
            title: 'Great experience',
            comment: 'Amazing work and very professional.',
            isApproved: true,
            isHidden: false
          },
          {
            authorId: clientUser.id,
            recipientId: artistUser.id,
            rating: 4,
            title: 'Good work',
            comment: 'Happy with the result, would recommend.',
            isApproved: true,
            isHidden: false
          }
        ]
      })
    })

    it('should get all reviews for an artist', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .query({ recipientId: artistUser.id })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.reviews).toHaveLength(2)
      expect(response.body.data.averageRating.average).toBe(4.5)
      expect(response.body.data.averageRating.count).toBe(2)
    })

    it('should get reviews with pagination', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .query({ page: 1, limit: 1 })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.reviews).toHaveLength(1)
      expect(response.body.data.pagination.page).toBe(1)
      expect(response.body.data.pagination.limit).toBe(1)
      expect(response.body.data.pagination.total).toBe(2)
    })

    it('should filter reviews by rating', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .query({ rating: 5 })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.reviews).toHaveLength(1)
      expect(response.body.data.reviews[0].rating).toBe(5)
    })
  })
})
