import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, authAPI } from '../services/api'
import { useToast } from './ToastContext'
import { setAccessToken, clearAccessToken, getAccessToken } from '../utils/tokenManager'

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
  const [accessToken, setAccessToken] = useState(null) // Store access token in memory only
  const navigate = useNavigate()
  const { success: showSuccessToast, error: showErrorToast } = useToast()

  // Check if user is logged in on app start using refresh token
  useEffect(() => {
    // Try to refresh token on app start
    refreshAccessToken()
  }, [])

  // Function to refresh access token using refresh token cookie
  const refreshAccessToken = async () => {
    try {
      const response = await authAPI.refreshToken()
      
      if (response.data && response.data.success) {
        const { accessToken: newAccessToken } = response.data.data
        // Store token securely in memory using token manager
        setAccessToken(newAccessToken)
        
        // Fetch user profile with new token
        await fetchUser()
      } else {
        // No valid refresh token, user needs to login
        setLoading(false)
      }
    } catch (error) {
      console.log('No valid refresh token, user needs to login')
      setLoading(false)
    }
  }

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
      
      // Handle 401 errors (token expired or invalid)
      if (error.response?.status === 401) {
        console.log('Access token expired, attempting to refresh...')
        
        try {
          // Try to refresh the access token
          await refreshAccessToken()
        } catch (refreshError) {
          console.log('Token refresh failed, user needs to login')
          // Clear all auth state
          setAccessToken(null)
          setUser(null)
          delete api.defaults.headers.common['Authorization']
        }
      } else {
        // For other errors (like 500), keep the token but set user to null temporarily
        console.log('Server error, keeping token but clearing user data temporarily')
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email)
      const response = await authAPI.login({ email, password })
      console.log('Login API response:', response)
      
      // Handle successful login
      if (response && response.data && response.data.success) {
        const { accessToken, user } = response.data.data || {}
        
        if (accessToken && user) {
          // Store access token securely in memory using token manager
          setAccessToken(accessToken)
          setUser(user)
          
          console.log('Login successful, navigating to home')
          console.log('Access token stored securely in memory, refresh token in httpOnly cookie')
          navigate('/')
          
          return { success: true }
        } else {
          console.error('Missing access token or user in response')
          return { success: false, error: 'Invalid response from server' }
        }
      } else {
        // Handle login failure
        const errorMessage = response?.data?.error || 'Login failed'
        const requiresEmailVerification = response?.data?.requiresEmailVerification || false
        
        console.log('Login failed:', errorMessage)
        return { 
          success: false, 
          error: errorMessage,
          requiresEmailVerification 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle different error types
      let errorMessage = 'Login failed'
      let requiresEmailVerification = false
      
      if (error.response) {
        // Server error response
        const status = error.response.status
        if (status === 401) {
          errorMessage = error.response.data?.error || 'Invalid email or password'
          requiresEmailVerification = error.response.data?.requiresEmailVerification || false
        } else if (status === 400) {
          errorMessage = error.response.data?.error || 'Invalid credentials'
        } else {
          errorMessage = error.response.data?.error || `Server error (${status})`
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { 
        success: false, 
        error: errorMessage,
        requiresEmailVerification 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      
      if (response && response.data && response.data.success) {
        const { requiresEmailVerification, user } = response.data.data || {}
        
        if (requiresEmailVerification) {
          // Show success message about email verification
          showSuccessToast('Registration Successful!', 'Please check your email to verify your account before logging in.')
          
          // Navigate to login page
          navigate('/login')
          return { success: true, requiresEmailVerification: true }
        } else {
          // Legacy case - if no email verification required
          const { token, user } = response.data.data || {}
          
          if (token && user) {
            // Store token securely in memory using token manager
            setAccessToken(token)
            setUser(user)
            
            navigate('/')
            return { success: true }
          } else {
            return { success: false, error: 'Invalid response from server' }
          }
        }
      } else {
        const errorMessage = response?.data?.error || 'Registration failed'
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error('Registration error:', error)
      
      let errorMessage = 'Registration failed'
      
      if (error.response) {
        const status = error.response.status
        if (status === 409) {
          errorMessage = 'User already exists'
        } else if (status === 400) {
          errorMessage = error.response.data?.error || 'Invalid registration data'
        } else {
          errorMessage = error.response.data?.error || `Server error (${status})`
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      // Call logout API to invalidate refresh token on server
      await authAPI.logout()
    } catch (error) {
      console.warn('Logout API call failed, but proceeding with local logout:', error)
    } finally {
      // Always perform local cleanup using secure token manager
      clearAccessToken()
      setUser(null)
      
      console.log('Logout completed, navigating to home')
      console.log('Access token securely cleared from memory, refresh token invalidated on server')
      navigate('/')
      
      return { success: true, message: 'Logged out successfully' }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      if (response.data && response.data.success && response.data.data) {
        setUser(response.data.data.user)
        return { success: true }
      } else {
        const message = response.data?.error || 'Profile update failed'
        return { success: false, error: message }
      }
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed'
      return { success: false, error: message }
    }
  }

  const updateUser = (updates) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updates
    }))
  }

  // Note: loginWithToken removed - tokens are now managed securely via refresh flow

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated: !!user,
    isArtist: user?.role === 'ARTIST' || user?.role === 'ARTIST_ADMIN',
    isClient: user?.role === 'CLIENT',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'ARTIST_ADMIN',
    isArtistAdmin: user?.role === 'ARTIST_ADMIN'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 