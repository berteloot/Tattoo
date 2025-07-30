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
      console.log('Response data keys:', Object.keys(response.data || {}))
      console.log('Response data.data:', response.data?.data)
      console.log('Response data.data keys:', Object.keys(response.data?.data || {}))
      
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
        console.log('Login failed with server error:', message)
        toast.error('Error', message)
        return { success: false, error: message }
      } else {
        // Invalid response format
        console.error('Invalid response format:', response)
        console.error('Response structure:', {
          hasResponse: !!response,
          hasData: !!(response && response.data),
          hasSuccess: !!(response && response.data && response.data.success),
          hasDataData: !!(response && response.data && response.data.data)
        })
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      console.error('Login error details:', error)
      console.error('Error response:', error.response)
      
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
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      console.error('Registration error details:', error)
      
      // Handle different error response structures
      let message = 'Registration failed'
      
      if (error.response && error.response.data) {
        // Server returned an error response
        message = error.response.data.error || error.response.data.message || 'Registration failed'
      } else if (error.message) {
        // Network or other error
        message = error.message
      }
      
      toast.error('Error', message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      // Call the logout API endpoint
      const response = await authAPI.logout()
      console.log('Logout API response:', response)
      
      // Check if the response is valid - handle different response structures
      if (response && response.data) {
        if (response.data.success) {
          console.log('Logout successful:', response.data.message || 'Logout successful')
        } else {
          console.warn('Logout response indicates failure:', response.data)
        }
      } else {
        console.warn('Logout response format unexpected:', response)
      }
    } catch (error) {
      // Even if the API call fails, we still want to logout locally
      console.warn('Logout API call failed, but proceeding with local logout:', error)
    } finally {
      // Always perform local cleanup
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      toast.success('Success', 'Logged out successfully')
      navigate('/')
    }
    
    // Always return a success value
    return { success: true }
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