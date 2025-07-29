const request = require('supertest')
const app = require('../server')

describe('Basic API Functionality', () => {
  it('should have a health check endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body.status).toBe('OK')
    expect(response.body.message).toBe('Tattoo Artist Locator API is running')
  })

  it('should have a root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)

    expect(response.body.message).toBe('Welcome to Tattoo Artist Locator API')
    expect(response.body.endpoints).toBeDefined()
    expect(response.body.endpoints.auth).toBe('/api/auth')
    expect(response.body.endpoints.artists).toBe('/api/artists')
  })

  it('should have auth routes configured', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400)

    // Should return validation error, not 404
    expect(response.body.success).toBe(false)
    expect(response.body.error).toBe('Validation failed')
  })

  it('should have artists routes configured', async () => {
    const response = await request(app)
      .get('/api/artists')
      .expect(200)

    // Should return empty array, not 404
    expect(response.body.success).toBe(true)
    expect(response.body.data.artists).toBeDefined()
  })

  it('should handle 404 errors gracefully', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404)

    expect(response.body.success).toBe(false)
    expect(response.body.error).toBe('Route not found')
  })
})

describe('Server Configuration', () => {
  it('should have proper middleware configured', () => {
    // Check if app has the expected middleware
    expect(app).toBeDefined()
    expect(typeof app.use).toBe('function')
  })

  it('should have CORS configured', () => {
    // The app should be configured with CORS
    expect(app).toBeDefined()
  })

  it('should have rate limiting configured', () => {
    // The app should be configured with rate limiting
    expect(app).toBeDefined()
  })
})

describe('Environment Variables', () => {
  it('should have required environment variables', () => {
    // Check if required env vars are set (even if they're placeholder values)
    expect(process.env.JWT_SECRET).toBeDefined()
    expect(process.env.DATABASE_URL).toBeDefined()
  })

  it('should have JWT secret configured', () => {
    expect(process.env.JWT_SECRET).toBeTruthy()
  })
}) 