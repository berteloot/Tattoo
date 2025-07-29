import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { Login } from '../pages/Login'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'

// Mock the API service
vi.mock('../services/api', () => ({
  authAPI: {
    login: vi.fn()
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

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form correctly', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/Forgot your password/i)).toBeInTheDocument()
  })

  it('allows user to fill out the form', () => {
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/Email address/i)
    const passwordInput = screen.getByLabelText(/Password/i)

    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('john@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('submits form with valid data successfully', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      data: {
        data: {
          user: {
            id: '1',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'CLIENT'
          },
          token: 'mock-token'
        }
      }
    })

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<Login />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(submitButton)

    // Wait for the API call
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123'
      })
    })

    // Check that token was stored
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
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

    renderWithProviders(<Login />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(submitButton)

    // Wait for the error to be handled
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  it('shows loading state during submission', async () => {
    const mockLogin = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<Login />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(submitButton)

    // Check loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText('Sign in')).toBeInTheDocument()
    })
  })

  it('validates required fields', () => {
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(submitButton)

    // Check that form validation prevents submission
    expect(screen.getByLabelText(/Email address/i)).toBeRequired()
    expect(screen.getByLabelText(/Password/i)).toBeRequired()
  })

  it('validates email format', () => {
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/Email address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    // Check that email validation works
    expect(emailInput).toBeInvalid()
  })

  it('clears errors when user starts typing', () => {
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/Email address/i)
    const passwordInput = screen.getByLabelText(/Password/i)

    // Trigger validation error
    fireEvent.change(emailInput, { target: { value: '' } })
    fireEvent.blur(emailInput)

    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })

    // Error should be cleared
    expect(emailInput).toBeValid()
  })

  it('provides link to registration page', () => {
    renderWithProviders(<Login />)
    
    const registerLink = screen.getByText(/create a new account/i)
    expect(registerLink).toBeInTheDocument()
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
  })

  it('provides link to forgot password page', () => {
    renderWithProviders(<Login />)
    
    const forgotPasswordLink = screen.getByText(/Forgot your password/i)
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password')
  })

  it('handles network errors gracefully', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Network error'))

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<Login />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(submitButton)

    // Wait for the error to be handled
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  it('validates form before submission', () => {
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(submitButton)

    // Form should not submit with empty fields
    expect(screen.getByLabelText(/Email address/i)).toBeInvalid()
    expect(screen.getByLabelText(/Password/i)).toBeInvalid()
  })

  it('handles successful login navigation', async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      data: {
        data: {
          user: {
            id: '1',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'CLIENT'
          },
          token: 'mock-token'
        }
      }
    })

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.login.mockImplementation(mockLogin)

    renderWithProviders(<Login />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(submitButton)

    // Wait for successful login
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })

    // Should navigate to home page
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('handles different error types', async () => {
    const testCases = [
      {
        error: { response: { data: { error: 'Invalid credentials' } } },
        expectedMessage: 'Invalid credentials'
      },
      {
        error: { response: { data: { error: 'Account is deactivated' } } },
        expectedMessage: 'Account is deactivated'
      },
      {
        error: new Error('Network error'),
        expectedMessage: 'Please check your credentials and try again.'
      }
    ]

    for (const testCase of testCases) {
      const mockLogin = vi.fn().mockRejectedValue(testCase.error)

      // Mock the API call
      const { authAPI } = await import('../services/api')
      authAPI.login.mockImplementation(mockLogin)

      renderWithProviders(<Login />)
      
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Sign in/i })
      fireEvent.click(submitButton)

      // Wait for the error to be handled
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })

      // Clean up for next test
      vi.clearAllMocks()
    }
  })
}) 