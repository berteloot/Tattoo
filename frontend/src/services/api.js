import axios from 'axios'

// Create axios instance - use relative URLs for same-domain deployment
// For production on Render, we're serving from the same domain, so use relative URLs
let API_URL = import.meta.env.VITE_API_URL || '/api'

// If environment variable is undefined, detect based on current location
if (!import.meta.env.VITE_API_URL) {
  const currentUrl = window.location.href
  if (currentUrl.includes('onrender.com')) {
    // Production on Render - use relative URLs since frontend and backend are on same domain
    API_URL = '/api'
  } else if (currentUrl.includes('localhost')) {
    // Development - use the proxy configuration
    API_URL = '/api'
  } else {
    // Fallback
    API_URL = '/api'
  }
}

console.log('API URL configured as:', API_URL)
console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('Current location:', window.location.href)

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url)
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
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
}

export const artistsAPI = {
  getAll: (params) => api.get('/artists', { params }),
  getById: (id) => api.get(`/artists/${id}`),
  createProfile: (profileData) => api.post('/artists', profileData),
  updateProfile: (id, profileData) => api.put(`/artists/${id}`, profileData),
}

export const flashAPI = {
  getAll: (params) => api.get('/flash', { params }),
  getById: (id) => api.get(`/flash/${id}`),
  create: (flashData) => api.post('/flash', flashData),
  update: (id, flashData) => api.put(`/flash/${id}`, flashData),
  delete: (id) => api.delete(`/flash/${id}`),
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