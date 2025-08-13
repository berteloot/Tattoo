import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff } from 'lucide-react'

export const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CLIENT'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { error: showErrorToast, success: showSuccessToast } = useToast()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await register(formData)
      if (result.success) {
        if (result.requiresEmailVerification) {
          showSuccessToast('Registration Successful!', 'Please check your email to verify your account before logging in.')
        }
      } else {
        showErrorToast('Registration Failed', result.error || 'Registration failed')
        console.error('Registration failed:', result.error)
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed'
      showErrorToast('Registration Failed', errorMessage)
      console.error('Registration error in component:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="tag tag--yellow">REGISTRATION</span>
          <h2>CREATE YOUR ACCOUNT</h2>
          <p className="deck">
            Or{' '}
            <Link to="/login" style={{ color: 'var(--accent-blue)' }}>
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                  FIRST NAME
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  placeholder="First name"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                  LAST NAME
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Last name"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                EMAIL ADDRESS
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter your email"
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="Create a password"
                  style={{ width: '100%', paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '20px', height: '20px', color: 'var(--muted)' }} />
                  ) : (
                    <Eye style={{ width: '20px', height: '20px', color: 'var(--muted)' }} />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                ACCOUNT TYPE
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="CLIENT"
                    checked={formData.role === 'CLIENT'}
                    onChange={handleChange}
                    style={{ margin: 0 }}
                  />
                  <span className="small">CLIENT</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="role"
                    value="ARTIST"
                    checked={formData.role === 'ARTIST'}
                    onChange={handleChange}
                    style={{ margin: 0 }}
                  />
                  <span className="small">ARTIST</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cta"
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600' }}
          >
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  )
} 