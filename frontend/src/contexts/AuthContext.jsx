import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, authAPI } from '../services/api'
import { useToast } from './ToastContext'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await authAPI.getProfile()
      
      // Check if response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        setUser(response.data.data.user)
      } else {
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      // Clear invalid token and user data
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      
      // Check if login was successful
      if (response && response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data
        
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        
        toast.success('Success', 'Login successful!')
        navigate('/')
        
        return { success: true }
      } else if (response && response.data && !response.data.success) {
        // Login failed with error message from server
        const message = response.data.error || 'Login failed'
        toast.error('Error', message)
        return { success: false, error: message }
      } else {
        // Invalid response format
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      console.error('Login error details:', error)
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed'
      toast.error('Error', message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      
      // Check if registration was successful
      if (response && response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data
        
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        
        toast.success('Success', 'Registration successful!')
        navigate('/')
        
        return { success: true }
      } else if (response && response.data && !response.data.success) {
        // Registration failed with error message from server
        const message = response.data.error || 'Registration failed'
        toast.error('Error', message)
        return { success: false, error: message }
      } else {
        // Invalid response format
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      console.error('Registration error details:', error)
      const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed'
      toast.error('Error', message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    toast.success('Success', 'Logged out successfully')
    navigate('/')
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      // Check if update was successful
      if (response.data && response.data.success && response.data.data) {
        setUser(response.data.data.user)
        toast.success('Success', 'Profile updated successfully!')
        return { success: true }
      } else if (response.data && !response.data.success) {
        // Update failed with error message from server
        const message = response.data.error || 'Profile update failed'
        toast.error('Error', message)
        return { success: false, error: message }
      } else {
        // Invalid response format
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed'
      toast.error('Error', message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isArtist: user?.role === 'ARTIST',
    isClient: user?.role === 'CLIENT',
    isAdmin: user?.role === 'ADMIN'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 