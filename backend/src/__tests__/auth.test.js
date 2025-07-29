const request = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const app = require('../../server')

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new client user successfully', async () => {
      const userData = {
        email: 'client@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('User registered successfully')
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.firstName).toBe(userData.firstName)
      expect(response.body.data.user.lastName).toBe(userData.lastName)
      expect(response.body.data.user.role).toBe('CLIENT')
      expect(response.body.data.user).not.toHaveProperty('password')
      expect(response.body.data).toHaveProperty('token')

      // Verify user was created in database
      const user = await testPrisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(user).toBeTruthy()
      expect(user.role).toBe('CLIENT')
    })

    it('should register a new artist user successfully', async () => {
      const userData = {
        email: 'artist@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'ARTIST'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user.role).toBe('ARTIST')
    })

    it('should default to CLIENT role when role is not specified', async () => {
      const userData = {
        email: 'default@example.com',
        password: 'password123',
        firstName: 'Default',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body.data.user.role).toBe('CLIENT')
    })

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        firstName: 'First',
        lastName: 'User'
      }

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('User with this email already exists')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
      expect(response.body.details).toBeInstanceOf(Array)
    })

    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })

    it('should validate password length', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })
  })

  describe('POST /api/auth/login', () => {
    let testUser

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'login@example.com',
        password: 'password123'
      })
    })

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Login successful')
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user.email).toBe(loginData.email)
      expect(response.body.data.user).not.toHaveProperty('password')
      expect(response.body.data).toHaveProperty('token')

      // Verify token is valid
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET)
      expect(decoded.id).toBe(testUser.id)
    })

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid credentials')
    })

    it('should return error for deactivated account', async () => {
      // Deactivate user
      await testPrisma.user.update({
        where: { id: testUser.id },
        data: { isActive: false }
      })

      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Account is deactivated')
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })
  })

  describe('GET /api/auth/me', () => {
    let testUser
    let authToken

    beforeEach(async () => {
      testUser = await createTestUser()
      authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET)
    })

    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user.email).toBe(testUser.email)
      expect(response.body.data.user).not.toHaveProperty('password')
    })

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not authorized, no token')
    })

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Not authorized, token failed')
    })

    it('should include artist profile for artists', async () => {
      const { user: artistUser } = await createTestArtist()
      const artistToken = jwt.sign({ id: artistUser.id }, process.env.JWT_SECRET)

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${artistToken}`)
        .expect(200)

      expect(response.body.data.user.artistProfile).toBeTruthy()
      expect(response.body.data.user.artistProfile.studioName).toBe('Test Studio')
    })
  })

  describe('PUT /api/auth/profile', () => {
    let testUser
    let authToken

    beforeEach(async () => {
      testUser = await createTestUser()
      authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET)
    })

    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '1234567890'
      }

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Profile updated successfully')
      expect(response.body.data.user.firstName).toBe(updateData.firstName)
      expect(response.body.data.user.lastName).toBe(updateData.lastName)
      expect(response.body.data.user.phone).toBe(updateData.phone)

      // Verify database was updated
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testUser.id }
      })
      expect(updatedUser.firstName).toBe(updateData.firstName)
      expect(updatedUser.lastName).toBe(updateData.lastName)
      expect(updatedUser.phone).toBe(updateData.phone)
    })

    it('should return error without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ firstName: 'Test' })
        .expect(401)

      expect(response.body.success).toBe(false)
    })

    it('should validate input data', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: '' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })
  })

  describe('POST /api/auth/logout', () => {
    let testUser
    let authToken

    beforeEach(async () => {
      testUser = await createTestUser()
      authToken = jwt.sign({ id: testUser.id }, process.env.JWT_SECRET)
    })

    it('should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Logout successful')
    })

    it('should return error without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    let testUser

    beforeEach(async () => {
      testUser = await createTestUser()
    })

    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('password reset link has been sent')

      // Verify reset token was created
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testUser.id }
      })
      expect(updatedUser.resetToken).toBeTruthy()
      expect(updatedUser.resetTokenExpiry).toBeTruthy()
    })

    it('should not reveal if user exists or not', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('password reset link has been sent')
    })

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })
  })

  describe('POST /api/auth/reset-password', () => {
    let testUser
    let resetToken

    beforeEach(async () => {
      testUser = await createTestUser()
      
      // Create reset token
      resetToken = require('crypto').randomBytes(32).toString('hex')
      await testPrisma.user.update({
        where: { id: testUser.id },
        data: {
          resetToken,
          resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
        }
      })
    })

    it('should reset password with valid token', async () => {
      const newPassword = 'newpassword123'

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('Password reset successfully')

      // Verify password was updated and token cleared
      const updatedUser = await testPrisma.user.findUnique({
        where: { id: testUser.id }
      })
      expect(updatedUser.resetToken).toBeNull()
      expect(updatedUser.resetTokenExpiry).toBeNull()

      // Verify new password works
      const isMatch = await bcrypt.compare(newPassword, updatedUser.password)
      expect(isMatch).toBe(true)
    })

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'newpassword123'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid or expired reset token')
    })

    it('should return error for expired token', async () => {
      // Set expired token
      await testPrisma.user.update({
        where: { id: testUser.id },
        data: {
          resetTokenExpiry: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      })

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid or expired reset token')
    })

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: '123'
        })
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Validation failed')
    })
  })
}) 