import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    defaults: {
      headers: {
        common: {}
      }
    }
  },
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    logout: vi.fn()
  }
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Test component to access auth context
const TestComponent = () => {
  const { user, login, register, logout, updateProfile, isAuthenticated, isArtist, isClient } = useAuth()
  
  return (
    <div>
      <div data-testid="user-info">
        {user ? `${user.firstName} ${user.lastName}` : 'No user'}
      </div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      <div data-testid="user-role">
        {isArtist ? 'Artist' : isClient ? 'Client' : 'None'}
      </div>
      <button onClick={() => login('test@example.com', 'password')} data-testid="login-btn">
        Login
      </button>
      <button onClick={() => register({ email: 'test@example.com', password: 'password' })} data-testid="register-btn">
        Register
      </button>
      <button onClick={logout} data-testid="logout-btn">
        Logout
      </button>
      <button onClick={() => updateProfile({ firstName: 'Updated' })} data-testid="update-profile-btn">
        Update Profile
      </button>
    </div>
  )
}

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('provides initial state correctly', () => {
    renderWithProviders(<TestComponent />)
    
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated')
    expect(screen.getByTestId('user-role')).toHaveTextContent('None')
  })

  it('loads user from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CLIENT'
    }

    const mockGetProfile = vi.fn().mockResolvedValue({
      data: { data: { user: mockUser } }
    })

    // Mock localStorage
    localStorage.getItem.mockReturnValue('mock-token')
    
    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.getProfile.mockImplementation(mockGetProfile)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      expect(screen.getByTestId('user-role')).toHaveTextContent('Client')
    })
  })

  it('handles login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CLIENT'
    }

    const mockLogin = vi.fn().mockResolvedValue({
      data: {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      }
    })

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<TestComponent />)
    
    const loginButton = screen.getByTestId('login-btn')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password')
    })

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })
  })

  it('handles login error', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: 'Invalid credentials'
        }
      }
    })

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<TestComponent />)
    
    const loginButton = screen.getByTestId('login-btn')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })

    // Should remain unauthenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated')
  })

  it('handles registration successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ARTIST'
    }

    const mockRegister = vi.fn().mockResolvedValue({
      data: {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      }
    })

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.register.mockImplementation(mockRegister)

    renderWithProviders(<TestComponent />)
    
    const registerButton = screen.getByTestId('register-btn')
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
      expect(screen.getByTestId('user-role')).toHaveTextContent('Artist')
    })
  })

  it('handles logout correctly', async () => {
    // Set up authenticated state
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CLIENT'
    }

    const mockGetProfile = vi.fn().mockResolvedValue({
      data: { data: { user: mockUser } }
    })

    localStorage.getItem.mockReturnValue('mock-token')
    
    const { authAPI } = await import('../services/api')
    authAPI.getProfile.mockImplementation(mockGetProfile)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })

    // Logout
    const logoutButton = screen.getByTestId('logout-btn')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(screen.getByTestId('user-info')).toHaveTextContent('No user')
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated')
      expect(screen.getByTestId('user-role')).toHaveTextContent('None')
    })
  })

  it('handles profile update successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CLIENT'
    }

    const updatedUser = {
      ...mockUser,
      firstName: 'Updated'
    }

    const mockGetProfile = vi.fn().mockResolvedValue({
      data: { data: { user: mockUser } }
    })

    const mockUpdateProfile = vi.fn().mockResolvedValue({
      data: { data: { user: updatedUser } }
    })

    localStorage.getItem.mockReturnValue('mock-token')
    
    const { authAPI } = await import('../services/api')
    authAPI.getProfile.mockImplementation(mockGetProfile)
    authAPI.updateProfile.mockImplementation(mockUpdateProfile)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })

    // Update profile
    const updateButton = screen.getByTestId('update-profile-btn')
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ firstName: 'Updated' })
    })

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('Updated Doe')
    })
  })

  it('handles profile update error', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CLIENT'
    }

    const mockGetProfile = vi.fn().mockResolvedValue({
      data: { data: { user: mockUser } }
    })

    const mockUpdateProfile = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: 'Update failed'
        }
      }
    })

    localStorage.getItem.mockReturnValue('mock-token')
    
    const { authAPI } = await import('../services/api')
    authAPI.getProfile.mockImplementation(mockGetProfile)
    authAPI.updateProfile.mockImplementation(mockUpdateProfile)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })

    // Update profile
    const updateButton = screen.getByTestId('update-profile-btn')
    fireEvent.click(updateButton)

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled()
    })

    // User should remain unchanged
    expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe')
  })

  it('clears token on profile fetch error', async () => {
    const mockGetProfile = vi.fn().mockRejectedValue(new Error('Token expired'))

    localStorage.getItem.mockReturnValue('expired-token')
    
    const { authAPI } = await import('../services/api')
    authAPI.getProfile.mockImplementation(mockGetProfile)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(mockGetProfile).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('token')
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated')
    })
  })

  it('provides correct role-based flags', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'ARTIST'
    }

    const mockGetProfile = vi.fn().mockResolvedValue({
      data: { data: { user: mockUser } }
    })

    localStorage.getItem.mockReturnValue('mock-token')
    
    const { authAPI } = await import('../services/api')
    authAPI.getProfile.mockImplementation(mockGetProfile)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('user-role')).toHaveTextContent('Artist')
    })
  })

  it('handles network errors gracefully', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Network error'))

    const { authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<TestComponent />)
    
    const loginButton = screen.getByTestId('login-btn')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })

    // Should remain unauthenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated')
  })

  it('sets authorization header on successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CLIENT'
    }

    const mockLogin = vi.fn().mockResolvedValue({
      data: {
        data: {
          user: mockUser,
          token: 'mock-token'
        }
      }
    })

    const { api, authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<TestComponent />)
    
    const loginButton = screen.getByTestId('login-btn')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })

    // Check that authorization header was set
    expect(api.defaults.headers.common.Authorization).toBe('Bearer mock-token')
  })

  it('removes authorization header on logout', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'CLIENT'
    }

    const mockGetProfile = vi.fn().mockResolvedValue({
      data: { data: { user: mockUser } }
    })

    localStorage.getItem.mockReturnValue('mock-token')
    
    const { api, authAPI } = await import('../services/api')
    authAPI.getProfile.mockImplementation(mockGetProfile)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated')
    })

    // Logout
    const logoutButton = screen.getByTestId('logout-btn')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(api.defaults.headers.common.Authorization).toBeUndefined()
    })
  })
}) 