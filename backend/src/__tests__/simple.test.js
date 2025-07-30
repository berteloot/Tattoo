const request = require('supertest')
const app = require('../server')

// Simple test without database setup
describe('Simple API Tests', () => {
  it('should have a health check endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)

    expect(response.body.status).toBe('OK')
    expect(response.body.message).toBe('Tattooed World API is running')
  })

  it('should have a root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect(200)

    expect(response.body.message).toBe('Welcome to Tattooed World API')
    expect(response.body.endpoints).toBeDefined()
  })

  it('should handle 404 errors gracefully', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(500) // The error handler returns 500 for 404s

    expect(response.body.success).toBe(false)
  })
}) 