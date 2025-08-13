const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Test database client
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/tattoo_app_test'
    }
  }
})

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
  
  // Connect to test database
  await testPrisma.$connect()
  
  // Clean database before all tests
  await cleanDatabase()
})

// Global test teardown
afterAll(async () => {
  // Clean database after all tests
  await cleanDatabase()
  
  // Disconnect from test database
  await testPrisma.$disconnect()
})

// Clean database function
async function cleanDatabase() {
  const tablenames = await testPrisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`
  
  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter(name => name !== '_prisma_migrations')
    .map(name => `"public"."${name}"`)
    .join(', ')

  try {
    await testPrisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
  } catch (error) {
    console.log({ error })
  }
}

// Helper function to create test user
async function createTestUser(userData = {}) {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'CLIENT'
  }
  
  const user = { ...defaultUser, ...userData }
  
  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(user.password, salt)
  
  return await testPrisma.user.create({
    data: {
      ...user,
      password: hashedPassword
    }
  })
}

// Helper function to create test artist
async function createTestArtist(userData = {}) {
  const user = await createTestUser({ ...userData, role: 'ARTIST' })
  
  const artistProfile = await testPrisma.artistProfile.create({
    data: {
      userId: user.id,
      bio: 'Test artist bio',
      studioName: 'Test Studio',
      city: 'Test City',
      state: 'Test State'
    }
  })
  
  return { user, artistProfile }
}

// Export helpers for use in tests
global.testPrisma = testPrisma
global.createTestUser = createTestUser
global.createTestArtist = createTestArtist
global.cleanDatabase = cleanDatabase 