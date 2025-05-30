/**
 * Authentication Flows Test Suite
 * Tests sign-up, sign-in, and sign-out functionality
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '@/lib/supabase/auth-context'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { sessionManager } from '@/lib/supabase/session-manager'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
  UserProfile: {}
}))

// Mock SessionManager
jest.mock('@/lib/supabase/session-manager', () => ({
  sessionManager: {
    initialize: jest.fn().mockResolvedValue(null),
    setEventHandlers: jest.fn().mockReturnThis(),
    refreshSession: jest.fn().mockResolvedValue(null),
    signOut: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn()
  }
}))

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    refresh: jest.fn()
  })
}))

// Test component that uses the auth context
const TestComponent = ({ onSignIn, onSignUp, onSignOut }: any) => {
  const auth = useAuth()
  return (
    <div>
      <div data-testid="loading-state">{auth.isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="auth-state">{auth.user ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-email">{auth.user?.email || 'No Email'}</div>
      <div data-testid="user-role">{auth.profile?.role || 'No Role'}</div>
      
      <button 
        data-testid="sign-in-button" 
        onClick={() => onSignIn && onSignIn(auth.signIn)}
      >
        Sign In
      </button>
      
      <button 
        data-testid="sign-up-button" 
        onClick={() => onSignUp && onSignUp(auth.signUp)}
      >
        Sign Up
      </button>
      
      <button 
        data-testid="sign-out-button" 
        onClick={() => {
          auth.signOut()
          onSignOut && onSignOut()
        }}
      >
        Sign Out
      </button>
    </div>
  )
}

describe('Authentication Flows', () => {
  let mockSupabase: any
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn().mockResolvedValue({}),
        onAuthStateChange: jest.fn().mockReturnValue({ 
          data: { subscription: { unsubscribe: jest.fn() } }
        })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    }
    
    // Mock the Supabase client creation
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
  })
  
  test('Initial state shows not authenticated and loading', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )
    
    // Initially should show loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')
    
    // After initialization, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
    })
    
    // Should show not authenticated
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated')
  })
  
  test('Sign in flow works correctly', async () => {
    // Mock successful sign in
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { user: { id: 'user-123', email: 'test@example.com' } }
      },
      error: null
    })
    
    // Mock profile fetch
    mockSupabase.single.mockResolvedValue({
      data: { role: 'customer', id: 'user-123' },
      error: null
    })
    
    const onSignIn = jest.fn()
    
    render(
      <AuthProvider>
        <TestComponent
          onSignIn={(signIn: any) => {
            signIn('test@example.com', 'password').then(onSignIn)
          }}
        />
      </AuthProvider>
    )
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
    })
    
    // Click sign in button
    fireEvent.click(screen.getByTestId('sign-in-button'))
    
    // Verify signInWithPassword was called correctly
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
    
    // Wait for sign in to complete
    await waitFor(() => {
      expect(onSignIn).toHaveBeenCalled()
    })
  })
  
  test('Sign up flow works correctly', async () => {
    // Mock successful sign up
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'new-user-123', email: 'new@example.com' },
        session: null
      },
      error: null
    })
    
    const onSignUp = jest.fn()
    
    render(
      <AuthProvider>
        <TestComponent
          onSignUp={(signUp: any) => {
            signUp('new@example.com', 'password', 'customer').then(onSignUp)
          }}
        />
      </AuthProvider>
    )
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
    })
    
    // Click sign up button
    fireEvent.click(screen.getByTestId('sign-up-button'))
    
    // Verify signUp was called correctly
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      options: {
        data: {
          role: 'customer',
        },
      }
    })
    
    // Wait for sign up to complete
    await waitFor(() => {
      expect(onSignUp).toHaveBeenCalled()
    })
  })
  
  test('Sign out flow works correctly', async () => {
    // Mock authenticated user
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123', email: 'test@example.com' }
        }
      }
    })
    
    // Mock profile fetch
    mockSupabase.single.mockResolvedValue({
      data: { role: 'customer', id: 'user-123' },
      error: null
    })
    
    const onSignOut = jest.fn()
    
    render(
      <AuthProvider>
        <TestComponent onSignOut={onSignOut} />
      </AuthProvider>
    )
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
    })
    
    // Click sign out button
    fireEvent.click(screen.getByTestId('sign-out-button'))
    
    // Verify signOut was called
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    
    // Wait for sign out callback
    await waitFor(() => {
      expect(onSignOut).toHaveBeenCalled()
    })
  })
  
  test('Error handling during sign in', async () => {
    // Mock sign in with error
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    })
    
    const onSignIn = jest.fn()
    
    render(
      <AuthProvider>
        <TestComponent
          onSignIn={(signIn: any) => {
            signIn('wrong@example.com', 'wrongpassword').then(onSignIn)
          }}
        />
      </AuthProvider>
    )
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
    })
    
    // Click sign in button
    fireEvent.click(screen.getByTestId('sign-in-button'))
    
    // Wait for sign in to complete with error
    await waitFor(() => {
      expect(onSignIn).toHaveBeenCalledWith({ error: { message: 'Invalid credentials' } })
    })
    
    // User should still be unauthenticated
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated')
  })
})
