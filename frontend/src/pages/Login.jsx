import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Input, Button, LoadingSpinner } from '../components/UXComponents'

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { login, user, status } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (status === 'auth' && user) {
      console.log('🔄 User already authenticated, redirecting from login page...')
      navigate('/')
    }
  }, [status, user, navigate])

  // Show loading while checking authentication status
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    )
  }

  // Don't render login form if user is already authenticated
  if (status === 'auth' && user) {
    return null
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        success('Welcome back!', 'You have successfully signed in.')
        // Navigation is handled in AuthContext
      } else {
        if (result.requiresEmailVerification) {
          showError('Email Verification Required', 'Please check your email and click the verification link before logging in.')
        } else {
          showError('Login failed', result.error || 'Please check your credentials and try again.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      showError('Login failed', 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="tag tag--yellow">AUTHENTICATION</span>
          <h2>SIGN IN TO YOUR ACCOUNT</h2>
          <p className="deck">
            Or{' '}
            <Link to="/register" style={{ color: 'var(--accent-blue)' }}>
              create a new account
            </Link>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="input"
                style={{ width: '100%' }}
              />
              {errors.email && (
                <p style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="input"
                style={{ width: '100%' }}
              />
              {errors.password && (
                <p style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '4px' }}>
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <Link 
              to="/forgot-password" 
              className="small"
              style={{ color: 'var(--accent-blue)' }}
            >
              Forgot your password?
            </Link>
            <Link 
              to="/verify-email" 
              className="small"
              style={{ color: 'var(--accent-blue)' }}
            >
              Resend verification email
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cta"
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600' }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  )
} 