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
  // Single source of truth for authentication state
  const [auth, setAuth] = useState({ user: null, status: 'loading' }) // 'loading' | 'auth' | 'anon'
  const [localAccessToken, setLocalAccessToken] = useState(null) // For token management
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
        const { user, accessToken } = response.data.data
        
        // Store the access token from session
        if (accessToken) {
          setAccessToken(accessToken)
          setLocalAccessToken(accessToken)
          console.log('🔑 Access token stored from session')
        }
        
        // Set authentication state
        setAuth({ user, status: 'auth' })
      } else {
        console.log('❌ Session invalid, user needs to login')
        setAuth({ user: null, status: 'anon' })
        setLocalAccessToken(null)
      }
    } catch (error) {
      console.log('❌ Session check failed:', error.message)
      setAuth({ user: null, status: 'anon' })
      setLocalAccessToken(null)
    }
  }

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login for:', email)
      const response = await authAPI.login({ email, password })
      
      if (response.data && response.data.success) {
        const { user, accessToken } = response.data.data
        
        // Store access token securely
        setAccessToken(accessToken)
        setLocalAccessToken(accessToken)
        
        // Re-check session after login to get full user data
        const sessionResponse = await authAPI.checkSession()
        if (sessionResponse.data && sessionResponse.data.success) {
          setAuth({ user: sessionResponse.data.data.user, status: 'auth' })
        }
        
        showSuccessToast('Login successful!')
        navigate('/')
        return { success: true }
      } else {
        showErrorToast('Login failed. Please check your credentials.')
        return { success: false, error: 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.'
      showErrorToast(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
      clearAccessToken()
      setLocalAccessToken(null)
      setAuth({ user: null, status: 'anon' })
      showSuccessToast('Logged out successfully')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local state
      clearAccessToken()
      setLocalAccessToken(null)
      setAuth({ user: null, status: 'anon' })
      navigate('/')
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
        setAuth({ user: response.data.data.user, status: 'auth' })
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
        setAuth({ user: null, status: 'anon' })
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
        setAuth({ user: null, status: 'anon' })
      }
    } finally {
      // Loading state is now handled by auth.status
    }
  }

  // Login function is now defined above

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
            setAuth({ user, status: 'auth' })
            
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

  // Logout function is now defined above

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData)
      
      if (response.data && response.data.success && response.data.data) {
        setAuth({ user: response.data.data.user, status: 'auth' })
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
    setAuth(prevAuth => ({
      ...prevAuth,
      user: prevAuth.user ? { ...prevAuth.user, ...updates } : null
    }))
  }

  // Note: loginWithToken removed - tokens are now managed securely via refresh flow

  // Helper function to handle authentication failure
  const handleAuthFailure = () => {
    console.log('Authentication failed, clearing state')
    
    // Clear token from tokenManager
    clearAccessToken()
    
    // Clear local state
    setLocalAccessToken(null)
    setAuth({ user: null, status: 'anon' })
    setRefreshAttempts(0)
    
    // Clear API headers
    delete api.defaults.headers.common['Authorization']
    
    // Define public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/editorial',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/artists',
      '/flash',
      '/studios',
      '/map',
      '/gallery',
      '/privacy-policy',
      '/terms-of-service',
      '/cookie-policy',
      '/contact-us'
    ]
    
    // Get current path
    const currentPath = window.location.pathname
    
    // Check if current path is public (exact match or starts with public path)
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || 
      currentPath.startsWith(route + '/') ||
      currentPath.startsWith('/artists/') ||
      currentPath.startsWith('/flash/') ||
      currentPath.startsWith('/studios/') ||
      currentPath.startsWith('/gallery/')
    )
    
    // Only redirect to login if on a protected route
    if (!isPublicRoute) {
      console.log('On protected route, redirecting to login')
      navigate('/login')
    } else {
      console.log('On public route, staying on current page')
    }
  }

  const value = {
    ...auth, // Spread the auth state (user, status)
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated: auth.status === 'auth',
    isArtist: auth.user?.role === 'ARTIST' || auth.user?.role === 'ARTIST_ADMIN',
    isClient: auth.user?.role === 'CLIENT',
    isAdmin: auth.user?.role === 'ADMIN' || auth.user?.role === 'ARTIST_ADMIN',
    isArtistAdmin: auth.user?.role === 'ARTIST_ADMIN'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 