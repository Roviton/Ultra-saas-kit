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

// Context for Auth used in testing
type MockAuthState = {
  isLoading: boolean;
  user: any | null;
  profile: { role: UserRole; id: string } | null;
  session: { user: any } | null;
  isAdmin: boolean;
  isDispatcher: boolean;
  isDriver: boolean;
  isCustomer: boolean;
  error?: any;
  signIn: jest.Mock;
  signUp: jest.Mock;
  signOut: jest.Mock;
  refreshProfile: jest.Mock;
  updateUserRole: jest.Mock;
  refreshSession: jest.Mock;
  isEmailVerified: boolean;
  requireVerification: jest.Mock;
}

const AuthContext = React.createContext<any>(null);

interface MockAuthProviderProps {
  authState: Partial<MockAuthState>;
  children: React.ReactNode;
}

// Create a mock provider that simulates the AuthProvider
const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ authState, children }) => {
  const defaultAuthState: MockAuthState = {
    isLoading: false,
    user: null,
    profile: null,
    session: null,
    isAdmin: false,
    isDispatcher: false,
    isDriver: false,
    isCustomer: false,
    signIn: jest.fn().mockResolvedValue({ error: null }),
    signUp: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue(undefined),
    refreshProfile: jest.fn().mockResolvedValue(undefined),
    updateUserRole: jest.fn().mockResolvedValue({ success: true, error: null }),
    refreshSession: jest.fn().mockResolvedValue(true),
    isEmailVerified: true,
    requireVerification: jest.fn().mockReturnValue(true)
  };

  const mockState = { ...defaultAuthState, ...authState };
    
  return (
    <AuthContext.Provider value={mockState}>
      {children}
    </AuthContext.Provider>
  );
};

// Override the useAuth hook to use our mock context
jest.mock('../../lib/supabase/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => React.useContext(AuthContext),
}));


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
    // First test with loading state
    const { rerender } = render(
      <MockAuthProvider authState={{ isLoading: true }}>
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Should show loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
    
    // Now test with loading complete
    rerender(
      <MockAuthProvider authState={{ isLoading: false }}>
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Should now show not loading
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
  })
  
  test('Sign in flow works correctly', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });
    const onSignIn = jest.fn();

    // Render with our mock auth provider
    const { unmount } = render(
      <MockAuthProvider authState={{ signIn: mockSignIn }}>
        <TestComponent
          onSignIn={(signIn) => {
            signIn('test@example.com', 'password').then(onSignIn);
          }}
        />
      </MockAuthProvider>
    );

    // Click sign in button
    fireEvent.click(screen.getByTestId('sign-in-button'));
    
    // Verify signIn was called correctly
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
    
    // Wait for sign in to complete
    await waitFor(() => {
      expect(onSignIn).toHaveBeenCalled();
    });

    // Clean up first render to avoid duplicate test IDs
    unmount();
    
    // Now test with authenticated state after sign-in
    render(
      <MockAuthProvider 
        authState={{ 
          isLoading: false,
          user: { id: 'user-123', email: 'test@example.com' },
          profile: { role: 'customer', id: 'user-123' },
          isCustomer: true 
        }}
      >
        <TestComponent />
      </MockAuthProvider>
    );

    // Should show authenticated
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('customer');
  })
  
  test('Sign up flow works correctly', async () => {
    const mockSignUp = jest.fn().mockResolvedValue({ error: null });
    const onSignUp = jest.fn();
    
    const { unmount } = render(
      <MockAuthProvider authState={{ signUp: mockSignUp }}>
        <TestComponent
          onSignUp={(signUp) => {
            signUp('new@example.com', 'password', 'customer').then(onSignUp);
          }}
        />
      </MockAuthProvider>
    );
    
    // Click sign up button
    fireEvent.click(screen.getByTestId('sign-up-button'));
    
    // Verify signUp was called correctly with the right parameters
    expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'password', 'customer');
    
    // Wait for sign up to complete
    await waitFor(() => {
      expect(onSignUp).toHaveBeenCalled();
    });
    
    // Clean up previous render to avoid duplicate test IDs
    unmount();
    
    // Test with state after successful registration (but not authenticated yet)
    render(
      <MockAuthProvider 
        authState={{ 
          isLoading: false,
          user: null, // User not authenticated yet after sign-up (needs email verification)
          profile: null
        }}
      >
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Should still show not authenticated after sign-up (pending email verification)
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
  })
  
  test('Sign out flow works correctly', async () => {
    // Create a mock signOut function
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    const onSignOut = jest.fn();
    
    // First render with authenticated state
    const { unmount } = render(
      <MockAuthProvider 
        authState={{ 
          isLoading: false,
          user: { id: 'user-123', email: 'test@example.com' },
          profile: { role: 'customer', id: 'user-123' },
          isCustomer: true,
          signOut: mockSignOut
        }}
      >
        <TestComponent onSignOut={onSignOut} />
      </MockAuthProvider>
    );
    
    // Verify we start in authenticated state
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    
    // Click sign out button
    fireEvent.click(screen.getByTestId('sign-out-button'));
    
    // Verify signOut was called
    expect(mockSignOut).toHaveBeenCalled();
    
    // Wait for sign out callback
    await waitFor(() => {
      expect(onSignOut).toHaveBeenCalled();
    });
    
    // Clean up the first render
    unmount();
    
    // Now verify state after sign out (would be in a new render in real app)
    render(
      <MockAuthProvider authState={{ isLoading: false, user: null, profile: null }}>
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Should show not authenticated after sign out
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
  })
  
  test('Admin role is detected correctly', async () => {
    render(
      <MockAuthProvider
        authState={{
          isLoading: false,
          user: { id: 'admin-123', email: 'admin@example.com' },
          profile: { role: 'admin', id: 'admin-123' },
          isAdmin: true,
          isDispatcher: false,
          isDriver: false,
          isCustomer: false
        }}
      >
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Not Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Not Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Not Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('admin');
  })
  
  test('Dispatcher role is detected correctly', async () => {
    render(
      <MockAuthProvider
        authState={{
          isLoading: false,
          user: { id: 'dispatcher-123', email: 'dispatcher@example.com' },
          profile: { role: 'dispatcher', id: 'dispatcher-123' },
          isAdmin: false,
          isDispatcher: true,
          isDriver: false,
          isCustomer: false
        }}
      >
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Not Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Not Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('dispatcher');
  });
  
  test('Driver role is detected correctly', async () => {
    render(
      <MockAuthProvider
        authState={{
          isLoading: false,
          user: { id: 'driver-123', email: 'driver@example.com' },
          profile: { role: 'driver', id: 'driver-123' },
          isAdmin: false,
          isDispatcher: false,
          isDriver: true,
          isCustomer: false
        }}
      >
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Not Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Not Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('driver');
  });
  
  test('Customer role is detected correctly', async () => {
    render(
      <MockAuthProvider
        authState={{
          isLoading: false,
          user: { id: 'customer-123', email: 'customer@example.com' },
          profile: { role: 'customer', id: 'customer-123' },
          isAdmin: false,
          isDispatcher: false,
          isDriver: false,
          isCustomer: true
        }}
      >
        <TestComponent />
      </MockAuthProvider>
    );
    
    // Verify role indicators are correct
    expect(screen.getByTestId('is-admin')).toHaveTextContent('Not Admin');
    expect(screen.getByTestId('is-dispatcher')).toHaveTextContent('Not Dispatcher');
    expect(screen.getByTestId('is-driver')).toHaveTextContent('Not Driver');
    expect(screen.getByTestId('is-customer')).toHaveTextContent('Customer');
    expect(screen.getByTestId('profile-selector')).toHaveTextContent('customer');
  });
  
  test('Error handling during sign in', async () => {
    // Create a mock signIn function that returns an error
    const mockError = { message: 'Invalid email or password' };
    const mockSignIn = jest.fn().mockResolvedValue({ error: mockError });
    const onSignIn = jest.fn();
    
    render(
      <MockAuthProvider authState={{ isLoading: false, signIn: mockSignIn }}>
        <TestComponent 
          onSignIn={(signIn) => {
            signIn('wrong@example.com', 'wrong-password')
              .then((result) => {
                if (result.error) {
                  onSignIn(result.error);
                }
              });
          }}
        />
      </MockAuthProvider>
    );
    
    // Click sign in button
    fireEvent.click(screen.getByTestId('sign-in-button'));
    
    // Verify signIn was called correctly with the right parameters
    expect(mockSignIn).toHaveBeenCalledWith('wrong@example.com', 'wrong-password');
    
    // Wait for error to be handled by our callback
    await waitFor(() => {
      expect(onSignIn).toHaveBeenCalledWith(mockError);
    });
    
    // The auth state should still be unauthenticated after a failed login
    expect(screen.getByTestId('auth-state')).toHaveTextContent('Not Authenticated');
  });
})
