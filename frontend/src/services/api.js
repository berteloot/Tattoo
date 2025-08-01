import axios from 'axios'

// Create axios instance - use relative URLs for same-domain deployment
// Frontend and backend are served from the same domain on Render
const API_URL = '/api'

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
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  changeEmail: (emailData) => api.put('/auth/change-email', emailData),
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
  uploadImage: (formData) => api.post('/flash/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
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