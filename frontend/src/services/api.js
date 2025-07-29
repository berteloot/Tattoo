import axios from 'axios'

// Create axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
console.log('API URL configured as:', API_URL)

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
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
}

export const artistsAPI = {
  getAll: (params) => api.get('/api/artists', { params }),
  getById: (id) => api.get(`/api/artists/${id}`),
  createProfile: (profileData) => api.post('/api/artists', profileData),
  updateProfile: (id, profileData) => api.put(`/api/artists/${id}`, profileData),
}

export const flashAPI = {
  getAll: (params) => api.get('/api/flash', { params }),
  getById: (id) => api.get(`/api/flash/${id}`),
  create: (flashData) => api.post('/api/flash', flashData),
  update: (id, flashData) => api.put(`/api/flash/${id}`, flashData),
  delete: (id) => api.delete(`/api/flash/${id}`),
}

export const reviewsAPI = {
  getAll: (params) => api.get('/api/reviews', { params }),
  create: (reviewData) => api.post('/api/reviews', reviewData),
  update: (id, reviewData) => api.put(`/api/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/api/reviews/${id}`),
}

export const specialtiesAPI = {
  getAll: () => api.get('/api/specialties'),
}

export const servicesAPI = {
  getAll: () => api.get('/api/services'),
} 