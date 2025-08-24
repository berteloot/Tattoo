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
  const [localAccessToken, setLocalAccessToken] = useState(null) // Renamed to avoid conflict
  const [isRefreshing, setIsRefreshing] = useState(false) // Prevent multiple refresh attempts
  const [refreshAttempts, setRefreshAttempts] = useState(0) // Track refresh attempts
  const [lastRefreshTime, setLastRefreshTime] = useState(0) // Track last refresh time
  const navigate = useNavigate()
  const { success: showSuccessToast, error: showErrorToast } = useToast()

  // Check if user is logged in on app start using session endpoint
  useEffect(() => {
    // Don't try to read HttpOnly cookies - they're invisible to JavaScript
    // Instead, call the session endpoint to check if user is authenticated
    console.log('🔄 Checking authentication status via session endpoint...')
    
    // Additional debugging for domain issues
    console.log('🌐 Current location:', window.location.href)
    console.log('🌐 Current hostname:', window.location.hostname)
    console.log('🌐 Current origin:', window.location.origin)
    
    checkSession()
  }, [])

  // Sync tokenManager state with local state
  useEffect(() => {
    const token = getAccessToken()
    if (token && token !== localAccessToken) {
      console.log('🔄 Syncing tokenManager state with local state')
      setLocalAccessToken(token)
    }
  }, [localAccessToken])

  // Function to check if user has valid session (server-side validation)
  const checkSession = async () => {
    try {
      console.log('🔄 Checking session via /api/auth/session endpoint...')
      const response = await authAPI.checkSession()
      
      if (response.data && response.data.success) {
        console.log('✅ Session valid, user is authenticated')
        const { user } = response.data.data
        
        // Set user data
        setUser(user)
        setLocalAccessToken(getAccessToken()) // Get token from tokenManager
        setAuthStatus('authenticated')
        setLoading(false)
      } else {
        console.log('❌ Session invalid, user needs to login')
        setUser(null)
        setLocalAccessToken(null)
        setAuthStatus('unauthenticated')
        setLoading(false)
      }
    } catch (error) {
      console.log('❌ Session check failed:', error.message)
      setUser(null)
      setLocalAccessToken(null)
      setAuthStatus('unauthenticated')
      setLoading(false)
    }
  }

  // Function to refresh access token using refresh token cookie
  const refreshAccessToken = async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing) {
      console.log('Refresh already in progress, skipping...')
      return
    }

    // Check if we've tried too many times recently
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshTime
    const maxRefreshAttempts = 3
    const minTimeBetweenRefreshes = 5000 // 5 seconds

    if (refreshAttempts >= maxRefreshAttempts && timeSinceLastRefresh < minTimeBetweenRefreshes) {
      console.log('Too many refresh attempts, waiting before retry...')
      setLoading(false)
      return
    }

    try {
      setIsRefreshing(true)
      setRefreshAttempts(prev => prev + 1)
      setLastRefreshTime(now)

      console.log(`🔄 Attempting token refresh (attempt ${refreshAttempts + 1}/${maxRefreshAttempts})`)
      console.log('🍪 Cookies being sent:', document.cookie)
      
      const response = await authAPI.refreshToken()
      
      console.log('🔄 Refresh API response:', response)
      
      if (response.data && response.data.success) {
        const { accessToken: newAccessToken } = response.data.data
        
        console.log('🔄 Token refresh successful, new token:', newAccessToken ? 'Present' : 'Missing')
        
        // Store token securely in memory using token manager
        setAccessToken(newAccessToken)
        console.log('✅ Token stored in tokenManager')
        
        // Also update local state for consistency
        setLocalAccessToken(newAccessToken)
        console.log('✅ Token synced to local state')
        
        // Reset refresh attempts on success
        setRefreshAttempts(0)
        
        // Fetch user profile with new token
        await fetchUser()
      } else {
        // No valid refresh token, user needs to login
        console.log('No valid refresh token in response')
        handleAuthFailure()
      }
    } catch (error) {
      console.log('Token refresh failed:', error.message)
      
      // Handle rate limiting - don't retry immediately
      if (error.response?.status === 429) {
        console.log('Rate limit exceeded during token refresh, will retry later')
        setLoading(false)
        return
      }
      
      // Handle 401 errors during refresh (refresh token expired)
      if (error.response?.status === 401) {
        const errorMessage = error.response.data?.error || 'Authentication failed'
        console.log('Refresh token error:', errorMessage)
        
        // Don't show error toasts for expected "no token" scenarios
        // Only show errors for actual authentication failures
        if (errorMessage === 'Refresh token expired') {
          console.log('Refresh token expired, user needs to login')
          showErrorToast('Session Expired', 'Your session has expired. Please log in again.')
        } else if (errorMessage === 'Refresh token not found') {
          console.log('No refresh token found, user needs to login')
          // Don't show error toast - this is expected for new users
        } else if (errorMessage === 'Invalid refresh token') {
          console.log('Invalid refresh token, user needs to login')
          // Don't show error toast - this is expected for new users
        } else if (errorMessage === 'User not found or inactive') {
          console.log('User not found or inactive, user needs to login')
          showErrorToast('Account Error', 'Account not found or inactive. Please log in again.')
        } else {
          console.log('Unknown refresh token error, user needs to login')
          // Don't show error toast for unknown token errors
        }
        
        handleAuthFailure()
        return
      }
      
      // For other errors, check if we should retry
      if (refreshAttempts < maxRefreshAttempts) {
        console.log(`Refresh failed, will retry in 5 seconds (attempt ${refreshAttempts}/${maxRefreshAttempts})`)
        setTimeout(() => {
          setIsRefreshing(false)
        }, 5000)
        return
      } else {
        console.log('Max refresh attempts reached, user needs to login')
        handleAuthFailure()
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchUser = async () => {
    try {
      console.log('🔍 Fetching user profile...')
      console.log('🔑 Current token in tokenManager:', getAccessToken() ? 'Present' : 'Missing')
      console.log('🔑 Current token in local state:', localAccessToken ? 'Present' : 'Missing')
      
      const response = await authAPI.getProfile()
      
      // Check if response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        console.log('✅ User profile fetched successfully')
        setUser(response.data.data.user)
      } else {
        throw new Error('Invalid response format from server')
      }
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      console.error('🔍 Error details:', {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        url: error.config?.url
      })
      
      // Handle rate limiting (429) - don't retry immediately
      if (error.response?.status === 429) {
        console.log('Rate limit exceeded, will retry later')
        setUser(null)
        setLoading(false)
        return
      }
      
      // Handle 401 errors (token expired or invalid)
      if (error.response?.status === 401) {
        console.log('🚨 401 Unauthorized - token may be invalid or expired')
        console.log('🔑 Token in tokenManager:', getAccessToken() ? 'Present' : 'Missing')
        console.log('🔑 Token in local state:', localAccessToken ? 'Present' : 'Missing')
        
        // Only attempt refresh if we're not already refreshing and haven't exceeded attempts
        if (!isRefreshing && refreshAttempts < 3) {
          console.log('🔄 Attempting token refresh...')
          try {
            // Try to refresh the access token
            await refreshAccessToken()
          } catch (refreshError) {
            console.log('❌ Token refresh failed, user needs to login')
            handleAuthFailure()
          }
        } else {
          console.log('⚠️ Skipping refresh attempt - already refreshing or max attempts reached')
          handleAuthFailure()
        }
        return
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
          // Reset refresh state on successful login
          setRefreshAttempts(0)
          setIsRefreshing(false)
          setLastRefreshTime(0)
          
          // Store access token securely in memory using token manager
          setAccessToken(accessToken)
          
          // Also update local state for consistency
          setLocalAccessToken(accessToken)
          
          setUser(user)
          
          // Debug: Check if refresh token cookie was set
          console.log('🍪 After login - All cookies:', document.cookie)
          console.log('🍪 After login - Cookies object:', document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=')
            acc[key] = value
            return acc
          }, {}))
          
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
      // Reset all authentication and refresh state
      setRefreshAttempts(0)
      setIsRefreshing(false)
      setLastRefreshTime(0)
      
      // Always perform local cleanup using secure token manager
      clearAccessToken()
      setLocalAccessToken(null)
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

  // Helper function to handle authentication failure
  const handleAuthFailure = () => {
    console.log('Authentication failed, clearing state and redirecting to login')
    
    // Clear token from tokenManager
    clearAccessToken()
    
    // Clear local state
    setLocalAccessToken(null)
    setUser(null)
    setRefreshAttempts(0)
    setLoading(false)
    
    // Clear API headers
    delete api.defaults.headers.common['Authorization']
    
    // Redirect to login page
    navigate('/login')
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