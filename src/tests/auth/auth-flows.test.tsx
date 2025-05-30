/**
 * Authentication Flows Test Suite
 * Tests sign-up, sign-in, and sign-out functionality
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider, useAuth } from '../../lib/supabase/auth-context'
import { createSupabaseBrowserClient } from '../../lib/supabase/client'
import { sessionManager } from '../../lib/supabase/session-manager'
import type { UserRole } from '../../types/supabase'

// Mock modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/test'),
  useSearchParams: jest.fn(() => new URLSearchParams())
}))

// Mock Supabase client
jest.mock('../../lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn(),
  UserProfile: {}
}))

// Mock SessionManager
jest.mock('../../lib/supabase/session-manager', () => {
  const mockSessionManager = {
    initialize: jest.fn().mockResolvedValue(null),
    setEventHandlers: jest.fn(function() { return this }),
    refreshSession: jest.fn().mockResolvedValue(null),
    signOut: jest.fn().mockResolvedValue(undefined),
    cleanup: jest.fn(),
    onSessionExpiring: jest.fn(),
    onSessionExpired: jest.fn()
  };
  
  return { sessionManager: mockSessionManager };
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
})

// Test component that uses the auth context
interface TestComponentProps {
  onSignIn?: (signIn: Function) => void;
  onSignUp?: (signUp: Function) => void;
  onSignOut?: () => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ onSignIn, onSignUp, onSignOut }) => {
  const auth = useAuth();
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

      {/* Role indicators */}
      <div data-testid="is-admin">{auth.profile?.role === 'admin' ? 'Admin' : 'Not Admin'}</div>
      <div data-testid="is-dispatcher">{auth.profile?.role === 'dispatcher' ? 'Dispatcher' : 'Not Dispatcher'}</div>
      <div data-testid="is-driver">{auth.profile?.role === 'driver' ? 'Driver' : 'Not Driver'}</div>
      <div data-testid="is-customer">{auth.profile?.role === 'customer' ? 'Customer' : 'Not Customer'}</div>

      {/* Auth state selectors */}
      <div data-testid="auth-state-selector">{auth.user ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="profile-selector">{auth.profile?.role || 'No Role'}</div>
    </div>
  );
}

describe('Authentication Flows', () => {
  let mockSupabase: any;
  let singleMock: jest.Mock;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create a mock for the single function that we can easily update
    singleMock = jest.fn().mockResolvedValue({
      data: null,
      error: null
    });
    
    // Setup mock Supabase client with proper chaining
    mockSupabase = {
      auth: {
        getSession: jest.fn().mockImplementation(() => {
          // Trigger auth state change automatically after a short delay
          setTimeout(() => {
            const callback = mockSupabase.auth.onAuthStateChange.mock.calls[0]?.[0];
            if (callback) {
              callback('INITIAL_SESSION', { session: null });
            }
          }, 10);
          
          return Promise.resolve({ data: { session: null }, error: null });
        }),
        signInWithPassword: jest.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        signUp: jest.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        signOut: jest.fn().mockResolvedValue({
          error: null
        }),
        onAuthStateChange: jest.fn().mockImplementation((callback) => {
          // Store the callback for later use
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        })
      },
      from: jest.fn().mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            single: singleMock
          }))
        }))
      }))
    };
    
    // Mock the Supabase client creation
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
  })
  
  test('Initial state shows not authenticated and loading', async () => {
    // Ensure initialize resolves quickly for testing
    mockSupabase.auth.getSession.mockImplementation(() => {
      setTimeout(() => {
        // Simulate auth state change to trigger loading state update
        const callback = mockSupabase.auth.onAuthStateChange.mock.calls[0][0];
        if (callback) {
          callback('INITIAL_SESSION', null);
        }
      }, 10);
      
      return Promise.resolve({ data: { session: null }, error: null });
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Initially should show loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    
    // After initialization, loading should be false
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    }, { timeout: 1000 });
    
    // Should show not authenticated
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
  })
  
  test('Sign in flow works correctly', async () => {
    // Mock successful sign in
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { user: { id: 'user-123', email: 'test@example.com' } }
      },
      error: null
    });
    
    // Mock profile fetch
    singleMock.mockResolvedValue({
      data: { role: 'customer', id: 'user-123' },
      error: null
    });
    
    const onSignIn = jest.fn();
    
    render(
      <AuthProvider>
        <TestComponent
          onSignIn={(signIn) => {
            signIn('test@example.com', 'password').then(onSignIn);
          }}
        />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click sign in button
    fireEvent.click(screen.getByTestId('sign-in-button'));
    
    // Verify signInWithPassword was called correctly
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
    
    // Wait for sign in to complete
    await waitFor(() => {
      expect(onSignIn).toHaveBeenCalled();
    });
  })
  
  test('Sign up flow works correctly', async () => {
    // Mock successful sign up
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'new-user-123', email: 'new@example.com' },
        session: null
      },
      error: null
    });
    
    const onSignUp = jest.fn();
    
    render(
      <AuthProvider>
        <TestComponent
          onSignUp={(signUp) => {
            signUp('new@example.com', 'password', 'customer').then(onSignUp);
          }}
        />
      </AuthProvider>
    );
    
    // Wait for initial loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click sign up button
    fireEvent.click(screen.getByTestId('sign-up-button'));
    
    // Verify signUp was called correctly
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password',
      options: {
        data: {
          role: 'customer',
        },
      }
    });
    
    // Wait for sign up to complete
    await waitFor(() => {
      expect(onSignUp).toHaveBeenCalled();
    });
  })
  
  test('Sign out flow works correctly', async () => {
    // Mock authenticated user
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'user-123', email: 'test@example.com' }
        }
      },
      error: null
    });
    
    // Mock profile fetch
    singleMock.mockResolvedValue({
      data: { role: 'customer', id: 'user-123' },
      error: null
    });
    
    const onSignOut = jest.fn();
    
    render(
      <AuthProvider>
        <TestComponent onSignOut={onSignOut} />
      </AuthProvider>
    );
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click sign out button
    fireEvent.click(screen.getByTestId('sign-out-button'));
    
    // Verify signOut was called
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    
    // Wait for sign out callback
    await waitFor(() => {
      expect(onSignOut).toHaveBeenCalled();
    });
  })
  
  test('Admin role is detected correctly', async () => {
    // Mock authenticated user with admin role
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'admin-123', email: 'admin@example.com' }
        }
      },
      error: null
    });
    
    // Mock profile fetch with admin role
    singleMock.mockResolvedValue({
      data: { role: 'admin', id: 'admin-123' },
      error: null
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Not Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Not Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Not Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('admin');
  })
  
  test('Dispatcher role is detected correctly', async () => {
    // Mock authenticated user with dispatcher role
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'dispatcher-123', email: 'dispatcher@example.com' }
        }
      },
      error: null
    });
    
    // Mock profile fetch with dispatcher role
    singleMock.mockResolvedValue({
      data: { role: 'dispatcher', id: 'dispatcher-123' },
      error: null
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Not Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Not Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('dispatcher');
  });
  
  test('Driver role is detected correctly', async () => {
    // Mock authenticated user with driver role
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'driver-123', email: 'driver@example.com' }
        }
      },
      error: null
    });
    
    // Mock profile fetch with driver role
    singleMock.mockResolvedValue({
      data: { role: 'driver', id: 'driver-123' },
      error: null
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Not Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Not Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('driver');
  });
  
  test('Customer role is detected correctly', async () => {
    // Mock authenticated user with customer role
    mockSupabase.auth.getSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'customer-123', email: 'customer@example.com' }
        }
      },
      error: null
    });
    
    // Mock profile fetch with customer role
    singleMock.mockResolvedValue({
      data: { role: 'customer', id: 'customer-123' },
      error: null
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Not Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Not Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('customer');
  });
  
  test('Error handling during sign in', async () => {
    // Mock sign in with error
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid email or password' }
    });
    
    const onSignIn = jest.fn();
    
    render(
      <AuthProvider>
        <TestComponent 
          onSignIn={(signIn) => {
            signIn('wrong@example.com', 'wrong-password')
              .then(() => {})
              .catch(onSignIn);
          }}
        />
      </AuthProvider>
    );
    
    // Wait for initial loading
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });
    
    // Click sign in button
    fireEvent.click(screen.getByTestId('sign-in-button'));
    
    // Verify error is handled
    await waitFor(() => {
      expect(onSignIn).toHaveBeenCalled();
    });
  });
})
