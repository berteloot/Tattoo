import axios from 'axios'

// Create axios instance - use environment variable or fallback based on environment
const getApiUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In development, proxy to backend
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // In production, use relative path (handled by Vercel rewrites)
  return '/api'
}

const API_URL = getApiUrl()

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure credentials are sent with requests
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Ensure FormData is sent with correct Content-Type
    if (config.data instanceof FormData) {
      // Remove the default Content-Type to let browser set it with boundary
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Only clear token and redirect for non-auth routes that return 401
    if (error.response?.status === 401 && 
        !error.config.url.includes('/auth/') && 
        !error.config.url.includes('/login') && 
        !error.config.url.includes('/register')) {
      console.log('Token expired or invalid, clearing token')
      localStorage.removeItem('token')
      // Don't redirect automatically, let components handle it
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  changeEmail: (emailData) => api.put('/auth/change-email', emailData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
}

export const artistsAPI = {
  getAll: (params) => api.get('/artists', { params }),
  getById: (id) => api.get(`/artists/${id}`),
  createProfile: (profileData) => api.post('/artists', profileData),
  updateProfile: (id, profileData) => api.put(`/artists/${id}`, profileData),
  getStudios: (id) => api.get(`/artists/${id}/studios`),
  getFavoriteClients: () => api.get('/artists/my-favorites'),
  emailFavoriteClients: (data) => api.post('/artists/email-favorites', data),
}

export const flashAPI = {
  getAll: (params) => api.get('/flash', { params }),
  getById: (id) => api.get(`/flash/${id}`),
  create: (flashData) => api.post('/flash', flashData),
  update: (id, flashData) => api.put(`/flash/${id}`, flashData),
  delete: (id) => api.delete(`/flash/${id}`),
  uploadImage: (formData) => api.post('/flash/upload', formData),
}

export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (reviewData) => api.post('/reviews', reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
}

export const specialtiesAPI = {
  getAll: () => api.get('/specialties'),
}

export const servicesAPI = {
  getAll: () => api.get('/services'),
}

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (artistId) => api.post('/favorites', { artistId }),
  remove: (artistId) => api.delete(`/favorites/${artistId}`),
  check: (artistId) => api.get(`/favorites/check/${artistId}`),
}

export const studiosAPI = {
  getAll: (params) => api.get('/studios', { params }),
  getById: (id) => api.get(`/studios/${id}`),
  search: (query) => api.get('/studios', { params: { search: query } }),
  create: (studioData) => api.post('/studios', studioData),
  claim: (studioId) => api.post(`/studios/${studioId}/claim`),
  addArtist: (studioId, artistId, role = 'ARTIST') => api.post(`/studios/${studioId}/artists`, { artistId, role }),
  removeArtist: (studioId, artistId) => api.delete(`/studios/${studioId}/artists/${artistId}`),
  getArtists: (studioId) => api.get(`/studios/${studioId}/artists`),
  leaveStudio: (studioId) => api.post(`/studios/${studioId}/leave`),
  requestToJoin: (studioId, data) => api.post(`/studios/${studioId}/join-request`, data),
  getJoinRequests: (studioId) => api.get(`/studios/${studioId}/join-requests`),
  respondToJoinRequest: (studioId, requestId, data) => api.put(`/studios/${studioId}/join-requests/${requestId}`, data),
}

export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  getById: (id) => api.get(`/gallery/${id}`),
  create: (formData) => api.post('/gallery', formData),
  update: (id, formData) => api.put(`/gallery/${id}`, formData),
  delete: (id) => api.delete(`/gallery/${id}`),
  like: (id) => api.post(`/gallery/${id}/like`),
  addComment: (id, comment) => api.post(`/gallery/${id}/comments`, { comment }),
  getStats: (artistId) => api.get(`/gallery/stats/artist/${artistId}`),
}

// Artist Messages API
export const messagesAPI = {
  // Get messages for a specific artist (public)
  getArtistMessages: (artistId) => 
    api.get(`/messages/artist/${artistId}`),
  
  // Get current user's messages (artist only)
  getMyMessages: () => 
    api.get('/messages/my-messages'),
  
  // Create a new message
  create: (messageData) => 
    api.post('/messages', messageData),
  
  // Update a message
  update: (messageId, messageData) => 
    api.put(`/messages/${messageId}`, messageData),
  
  // Delete a message
  delete: (messageId) => 
    api.delete(`/messages/${messageId}`)
} 