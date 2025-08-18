import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { Register } from '../pages/Register'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'

// Mock the API service
vi.mock('../services/api', () => ({
  authAPI: {
    register: vi.fn()
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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders registration form correctly', () => {
    renderWithProviders(<Register />)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/I am a/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument()
  })

  it('allows user to fill out the form', () => {
    renderWithProviders(<Register />)
    
    const firstNameInput = screen.getByLabelText(/First name/i)
    const lastNameInput = screen.getByLabelText(/Last name/i)
    const emailInput = screen.getByLabelText(/Email address/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const roleSelect = screen.getByLabelText(/I am a/i)

    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(roleSelect, { target: { value: 'ARTIST' } })

    expect(firstNameInput.value).toBe('John')
    expect(lastNameInput.value).toBe('Doe')
    expect(emailInput.value).toBe('john@example.com')
    expect(passwordInput.value).toBe('password123')
    expect(roleSelect.value).toBe('ARTIST')
  })

  it('toggles password visibility', () => {
    renderWithProviders(<Register />)
    
    const passwordInput = screen.getByLabelText(/Password/i)
    const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

    // Password should be hidden by default
    expect(passwordInput.type).toBe('password')

    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('text')

    // Click to hide password again
    fireEvent.click(toggleButton)
    expect(passwordInput.type).toBe('password')
  })

  it('submits form with valid data successfully', async () => {
    const mockRegister = vi.fn().mockResolvedValue({
      data: {
        data: {
          user: {
            id: '1',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'ARTIST'
          },
          token: 'mock-token'
        }
      }
    })

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.register.mockImplementation(mockRegister)

    renderWithProviders(<Register />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/I am a/i), { target: { value: 'ARTIST' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create account/i })
    fireEvent.click(submitButton)

    // Wait for the API call
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'ARTIST'
      })
    })

    // Check that token was stored
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
  })

  it('handles registration error', async () => {
    const mockRegister = vi.fn().mockRejectedValue({
      response: {
        data: {
          error: 'User with this email already exists'
        }
      }
    })

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.register.mockImplementation(mockRegister)

    renderWithProviders(<Register />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create account/i })
    fireEvent.click(submitButton)

    // Wait for the error to be handled
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled()
    })
  })

  it('shows loading state during submission', async () => {
    const mockRegister = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.register.mockImplementation(mockRegister)

    renderWithProviders(<Register />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create account/i })
    fireEvent.click(submitButton)

    // Check loading state
    expect(screen.getByText('Creating account...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText('Create account')).toBeInTheDocument()
    })
  })

  it('validates required fields', () => {
    renderWithProviders(<Register />)
    
    const submitButton = screen.getByRole('button', { name: /Create account/i })
    fireEvent.click(submitButton)

    // Check that form validation prevents submission
    expect(screen.getByLabelText(/First name/i)).toBeRequired()
    expect(screen.getByLabelText(/Last name/i)).toBeRequired()
    expect(screen.getByLabelText(/Email address/i)).toBeRequired()
    expect(screen.getByLabelText(/Password/i)).toBeRequired()
  })

  it('validates email format', () => {
    renderWithProviders(<Register />)
    
    const emailInput = screen.getByLabelText(/Email address/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    // Check that email validation works
    expect(emailInput).toBeInvalid()
  })

  it('validates password length', () => {
    renderWithProviders(<Register />)
    
    const passwordInput = screen.getByLabelText(/Password/i)
    fireEvent.change(passwordInput, { target: { value: '123' } })
    fireEvent.blur(passwordInput)

    // Check that password validation works
    expect(passwordInput).toBeInvalid()
  })

  it('defaults to CLIENT role', () => {
    renderWithProviders(<Register />)
    
    const roleSelect = screen.getByLabelText(/I am a/i)
    expect(roleSelect.value).toBe('CLIENT')
  })

  it('provides link to login page', () => {
    renderWithProviders(<Register />)
    
    const loginLink = screen.getByText(/sign in to your existing account/i)
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
  })

  it('handles network errors gracefully', async () => {
    const mockRegister = vi.fn().mockRejectedValue(new Error('Network error'))

    // Mock the API call
    const { authAPI } = await import('../services/api')
    authAPI.register.mockImplementation(mockRegister)

    renderWithProviders(<Register />)
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: 'John' } })
    fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: 'Doe' } })
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create account/i })
    fireEvent.click(submitButton)

    // Wait for the error to be handled
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled()
    })
  })
}) 