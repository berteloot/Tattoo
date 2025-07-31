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
      console.log('Attempting login for:', email)
      const response = await authAPI.login({ email, password })
      console.log('Login API response:', response)
      console.log('Response data:', response.data)
      
      // Check if login was successful
      if (response && response.data && response.data.success && response.data.data) {
        const { token, user } = response.data.data
        
        // Validate that we have the required data
        if (!token || !user) {
          console.error('Missing token or user in response:', response.data.data)
          toast.error('Error', 'Invalid response from server')
          return { success: false, error: 'Invalid response from server' }
        }
        
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setUser(user)
        
        toast.success('Success', 'Login successful!')
        navigate('/')
        
        return { success: true }
      } else if (response && response.data && !response.data.success) {
        // Login failed with error message from server
        const message = response.data.error || 'Login failed'
        console.log('Login failed with server error:', message)
        toast.error('Error', message)
        return { success: false, error: message }
      } else {
        // Invalid response format
        console.error('Invalid response format:', response)
        toast.error('Error', 'Invalid response from server')
        return { success: false, error: 'Invalid response from server' }
      }
    } catch (error) {
      console.error('Login error details:', error)
      
      // Handle different error response structures
      let message = 'Login failed'
      
      if (error.response && error.response.data) {
        // Server returned an error response
        message = error.response.data.error || error.response.data.message || 'Login failed'
        console.log('Server error response:', error.response.data)
      } else if (error.message) {
        // Network or other error
        message = error.message
        console.log('Network/other error:', error.message)
      }
      
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
        const message = 'Invalid response from server'
        toast.error('Error', message)
        return { success: false, error: message }
      }
    } catch (error) {
      console.error('Registration error details:', error)
      
      // Handle different error response structures
      let message = 'Registration failed'
      
      if (error && error.response) {
        // Server returned an error response
        if (error.response.status === 400) {
          // Bad request - likely validation error or user already exists
          message = error.response.data?.error || 'Invalid registration data'
        } else if (error.response.status === 409) {
          // Conflict - user already exists
          message = error.response.data?.error || 'User already exists'
        } else if (error.response.data) {
          message = error.response.data.error || error.response.data.message || 'Registration failed'
        } else {
          message = `Server error (${error.response.status})`
        }
      } else if (error && error.message) {
        // Network or other error
        message = error.message
      } else if (error && typeof error === 'string') {
        // Error is a string
        message = error
      } else {
        // Unknown error type
        message = 'An unexpected error occurred during registration'
      }
      
      toast.error('Error', message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    let result = { success: true, message: 'Logout completed' }
    
    try {
      // Call the logout API endpoint
      const response = await authAPI.logout()
      console.log('Logout API response:', response)
      
      // Check if the response is valid - handle different response structures
      if (response && response.data) {
        if (response.data.success) {
          console.log('Logout successful:', response.data.message || 'Logout successful')
          result.message = response.data.message || 'Logout successful'
        } else {
          console.warn('Logout response indicates failure:', response.data)
          result.success = false
          result.error = response.data.error || 'Logout failed'
        }
      } else {
        console.warn('Logout response format unexpected:', response)
      }
    } catch (error) {
      // Even if the API call fails, we still want to logout locally
      console.warn('Logout API call failed, but proceeding with local logout:', error)
      result.success = false
      result.error = 'Logout API call failed, but local logout completed'
    } finally {
      // Always perform local cleanup
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      toast.success('Success', 'Logged out successfully')
      navigate('/')
    }
    
    // Always return a result object
    return result
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

  const updateUser = (updates) => {
    // Update user state with new data (for email changes)
    setUser(prevUser => ({
      ...prevUser,
      ...updates
    }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
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