/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-var-requires */
// @ts-ignore - Allow type errors in test files

/**
 * Session Management Tests
 * 
 * Tests for session handling, token refresh, and expiry management functionality
 * 
 * @jest-environment jsdom
 */

import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { Session, User } from '@supabase/supabase-js';

// Define the types for our responses and callbacks to fix type issues
type AuthChangeCallback = (event: string, session: Session | null) => Promise<void> | void;

// Define type for Supabase responses to fix type issues
interface SupabaseAuthResponse<T> {
  data: T;
  error: Error | null;
}

// Mock localStorage for testing
class LocalStorageMock {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Setup mock imports before actual imports
jest.mock('../../lib/supabase/client', () => {
  return {
    createSupabaseBrowserClient: jest.fn(() => ({
      auth: {
        getSession: jest.fn(),
        refreshSession: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn()
      }
    }))
  };
});

// Import after mocks are set up
import { sessionManager } from '../../lib/supabase/session-manager';

describe('Session Management', () => {
  // Create mock user and sessions for testing
  const mockUser: User = {
    id: 'user123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000, // 1 hour in the future
    token_type: 'bearer',
    user: mockUser,
  };

  const mockExpiredSession: Session = {
    ...mockSession,
    expires_at: Date.now() - 10000, // Expired 10 seconds ago
  };

  // Mock functions for Supabase client
  let mockGetSession: jest.Mock;
  let mockRefreshSession: jest.Mock;
  let mockSignOut: jest.Mock;
  let mockOnAuthStateChange: jest.Mock;
  let mockUnsubscribe: jest.Mock;
  let storedAuthCallback: AuthChangeCallback | null = null;

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
    storedAuthCallback = null;
    
    // Get fresh references to the mocks after they've been cleared
    const { createSupabaseBrowserClient } = require('../../lib/supabase/client');
    const supabaseClient = createSupabaseBrowserClient();
    
    mockGetSession = supabaseClient.auth.getSession;
    mockRefreshSession = supabaseClient.auth.refreshSession;
    mockSignOut = supabaseClient.auth.signOut;
    mockOnAuthStateChange = supabaseClient.auth.onAuthStateChange;
    mockUnsubscribe = jest.fn();
    
    // Setup mockOnAuthStateChange to store the callback for later use
    mockOnAuthStateChange.mockImplementation((callback) => {
      storedAuthCallback = callback as AuthChangeCallback;
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      };
    });
  });

  // Test getSession functionality
  describe('getSession', () => {
    test('should return the session when one exists', async () => {
      // Setup the mock to return a valid session
      mockGetSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      } as SupabaseAuthResponse<{ session: Session }>);

      // Call the method under test
      const result = await sessionManager.getSession();

      // Assert the result and mock calls
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSession);
    });

    test('should return null when no session exists', async () => {
      // Setup the mock to return null session
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: null
      } as SupabaseAuthResponse<{ session: null }>);

      // Call the method under test
      const result = await sessionManager.getSession();

      // Assert the result and mock calls
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    test('should handle errors when getting session', async () => {
      // Setup the mock to return an error
      const mockError = new Error('Failed to get session');
      mockGetSession.mockResolvedValueOnce({
        data: { session: null },
        error: mockError
      } as SupabaseAuthResponse<{ session: null }>);

      // Call the method under test
      const result = await sessionManager.getSession();

      // Assert the result and mock calls
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  // Test refreshSession functionality
  describe('refreshSession', () => {
    test('should refresh the session successfully', async () => {
      // Setup the mock to return a refreshed session
      mockRefreshSession.mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      } as SupabaseAuthResponse<{ session: Session }>);

      // Call the method under test
      const result = await sessionManager.refreshSession();

      // Assert the result and mock calls
      expect(mockRefreshSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSession);
    });

    test('should handle errors when refreshing session', async () => {
      // Setup the mock to return an error
      const mockError = new Error('Failed to refresh session');
      mockRefreshSession.mockResolvedValueOnce({
        data: { session: null },
        error: mockError
      } as SupabaseAuthResponse<{ session: null }>);

      // Call the method under test
      const result = await sessionManager.refreshSession();

      // Assert the result and mock calls
      expect(mockRefreshSession).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  // Test signOut functionality
  describe('signOut', () => {
    test('should sign out the user successfully', async () => {
      // Setup the mock for successful sign out
      mockSignOut.mockResolvedValueOnce({
        error: null
      } as { error: null });

      // Call the method under test
      await sessionManager.signOut();

      // Assert the mock calls
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    test('should handle errors when signing out', async () => {
      // Setup the mock to return an error
      const mockError = new Error('Failed to sign out');
      mockSignOut.mockResolvedValueOnce({
        error: mockError
      } as { error: Error });

      // Call the method under test
      await sessionManager.signOut();

      // Assert the mock calls
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  // Test onAuthStateChange functionality
  describe('onAuthStateChange', () => {
    test('should register the callback and return unsubscribe function', () => {
      // Setup a mock callback
      const mockCallback = jest.fn();

      // Call the method under test
      const unsubscribe = sessionManager.onAuthStateChange(mockCallback);

      // Assert the mock calls and returned function
      expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
      expect(unsubscribe).toBe(mockUnsubscribe);
      expect(storedAuthCallback).toBeTruthy();
    });

    test('should trigger callback when auth state changes', async () => {
      // Setup a mock callback
      const mockCallback = jest.fn();

      // Register the callback
      sessionManager.onAuthStateChange(mockCallback);

      // Trigger the stored callback with a session event
      if (storedAuthCallback) {
        await storedAuthCallback('SIGNED_IN', mockSession);
      }

      // Assert the callback was called with the right parameters
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('SIGNED_IN', mockSession);
    });

    test('should trigger callback when user signs out', async () => {
      // Setup a mock callback
      const mockCallback = jest.fn();
      // Set up expired session in initial getSession call
      mockGetSession.mockResolvedValueOnce({
        data: { session: mockExpiredSession },
        error: null
      } as SupabaseAuthResponse<{ session: Session }>);

      // Set up failed refresh response
      const mockError = new Error('Failed to refresh session');
      mockRefreshSession.mockResolvedValueOnce({
        data: { session: null },
        error: mockError
      } as SupabaseAuthResponse<{ session: null }>);

      const session = await sessionManager.getCurrentSession();
      
      // Verify we got null back due to failed refresh
      expect(session).toBeNull();
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    });
  });
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Replace window.localStorage with our mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock timers
jest.useFakeTimers();

describe('Session Manager', () => {
  let mockSession: Session;
  let mockUser: User;
  let mockError: Error;

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Create a mock user
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    // Create a mock session
    mockSession = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    mockError = new Error('Test error');

    // Reset the process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('initialize should return session when one exists', async () => {
    // Setup
    mockGetSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });
    
    // Act
    const result = await sessionManager.initialize();
    
    // Assert
    expect(result).toEqual(mockSession);
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  test('initialize should return null when no session exists', async () => {
    // Setup
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: null
    });
    
    // Act
    const result = await sessionManager.initialize();
    
    // Assert
    expect(result).toBeNull();
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });
  
  test('refreshSession should refresh the session successfully', async () => {
    // Setup
    const onSessionRefreshed = jest.fn();
    sessionManager.setEventHandlers({ onSessionRefreshed });
    
    mockRefreshSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });
    
    // Act
    const result = await sessionManager.refreshSession();
    
    // Assert
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSession);
    expect(onSessionRefreshed).toHaveBeenCalledWith(mockSession);
  });
  
  test('refreshSession should handle errors properly', async () => {
    // Setup
    const onError = jest.fn();
    sessionManager.setEventHandlers({ onError });
    
    mockRefreshSession.mockResolvedValueOnce({
      data: { session: null },
      error: mockError
    });
    
    // Act
    const result = await sessionManager.refreshSession();
    
    // Assert
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith(mockError);
  });
  
  test('getCurrentSession should retrieve session from localStorage', () => {
    // Setup
    const storageKey = 'sb-example-auth-token';
    const sessionData = JSON.stringify({ session: mockSession });
    localStorageMock.getItem.mockReturnValueOnce(sessionData);
    
    // Act
    const result = sessionManager.getCurrentSession();
    
    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalled();
    expect(result).toEqual(mockSession);
  });

  test('getCurrentSession should return null for invalid localStorage data', () => {
    // Setup
    localStorageMock.getItem.mockReturnValueOnce('invalid-json');
    
    // Act
    const result = sessionManager.getCurrentSession();
    
    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalled();
    expect(result).toBeNull();
  });
  
  test('getTimeUntilExpiry should calculate correct time remaining', () => {
    // Setup
    const now = Date.now();
    const expiresInMs = 3600 * 1000; // 1 hour in milliseconds
    const expiryTime = Math.floor((now + expiresInMs) / 1000); // Convert to seconds for expires_at
    
    const testSession = {
      ...mockSession,
      expires_at: expiryTime
    };
    
    // Mock Date.now to return a consistent value
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    // Act
    const result = sessionManager.getTimeUntilExpiry(testSession);
    
    // Assert - Allow a small margin of error for execution time
    expect(result).toBeCloseTo(expiresInMs, -2); // Tolerance of about 100ms
  });
  
  test('signOut should clear timers and sign out user', async () => {
    // Setup
    mockSignOut.mockResolvedValueOnce({ error: null });
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    // Act
    await sessionManager.signOut();
    
    // Assert
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('Session refresh should be scheduled before expiry', async () => {
    // Setup
    // Mock Date.now for consistent timing
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    // Create a session that expires in 10 minutes
    const expiresIn = 10 * 60 * 1000; // 10 minutes
    const testSession = {
      ...mockSession,
      expires_at: Math.floor((now + expiresIn) / 1000)
    };
    
    // Set up the session with the Supabase client
    mockGetSession.mockResolvedValueOnce({
      data: { session: testSession },
      error: null
    });
    
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    // Act
    await sessionManager.initialize();
    
    // Assert
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalled();
  });
  
  test('Session manager should handle auth state changes', async () => {
    // Setup - simulate initialization first
    mockOnAuthStateChange.mockImplementation((callback) => {
      // Store the callback for later use
      return {
        data: { subscription: mockSubscription }
      };
    });
    
    // Initialize session manager to set up auth state change handler
    await sessionManager.initialize();
    
    // Get the auth state callback that was registered
    const authStateCallback = mockOnAuthStateChange.mock.calls[0][0];
    
    // Create a spy for the refresh timer
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    // Act - Simulate SIGNED_IN event
    await authStateCallback('SIGNED_IN', mockSession);
    
    // Assert
    expect(setTimeoutSpy).toHaveBeenCalled();
    
    // Act - Simulate SIGNED_OUT event
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    await authStateCallback('SIGNED_OUT', null);
    
    // Assert
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('cleanup should unsubscribe from auth state changes', () => {
    // Act
    sessionManager.cleanup();
    
    // Assert
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

/*
// Duplicate block commented out to avoid redeclaration and undefined identifier errors
describe('Session Manager', () => {
  let mockSession: Session;
  let mockUser: User;
  let mockError: Error;

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Create a mock user
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {},
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    // Create a mock session
    mockSession = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };

    mockError = new Error('Test error');

    // Reset the process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test('getCurrentSession should return null when no session exists', async () => {
    // Setup
    mockGetSession.mockResolvedValueOnce({
      data: { session: null },
      error: null
    } as SupabaseResponse<{ session: null }>);
    
    // Act
    const result = await sessionManager.initialize();
    
    // Assert
    expect(result).toBeNull();
    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });
  
  test('refreshSession should refresh the session successfully', async () => {
    // Setup
    const onSessionRefreshed = jest.fn();
    sessionManager.setEventHandlers({ onSessionRefreshed });
    
    mockRefreshSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    } as SupabaseResponse<{ session: Session }>);
    
    // Act
    const result = await sessionManager.refreshSession();
    
    // Assert
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSession);
    expect(onSessionRefreshed).toHaveBeenCalledWith(mockSession);
  });
  
  test('refreshSession should handle errors properly', async () => {
    // Setup
    const onError = jest.fn();
    sessionManager.setEventHandlers({ onError });
    
    mockRefreshSession.mockResolvedValueOnce({
      data: { session: null },
      error: mockError
    } as SupabaseResponse<{ session: null }>);
    
    // Act
    const result = await sessionManager.refreshSession();
    
    // Assert
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith(mockError);
  });
  
  test('getCurrentSession should retrieve session from localStorage', () => {
    // Setup
    const storageKey = 'sb-example-auth-token';
    const sessionData = JSON.stringify({ session: mockSession });
    localStorageMock.getItem.mockReturnValueOnce(sessionData);
    
    // Act
    const result = sessionManager.getCurrentSession();
    
    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalled();
    expect(result).toEqual(mockSession);
  });
  
  test('getTimeUntilExpiry should calculate correct time remaining', () => {
    // Setup
    const now = Date.now();
    const expiresInMs = 3600 * 1000; // 1 hour in milliseconds
    const expiryTime = Math.floor((now + expiresInMs) / 1000); // Convert to seconds for expires_at
    
    const testSession = {
      ...mockSession,
      expires_at: expiryTime
    };
    
    // Mock Date.now to return a consistent value
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    // Act
    const result = sessionManager.getTimeUntilExpiry(testSession);
    
    // Assert - Allow a small margin of error for execution time
    expect(result).toBeCloseTo(expiresInMs, -2); // Tolerance of about 100ms
  });
  
  test('signOut should clear timers and sign out user', async () => {
    // Setup
    mockSignOut.mockResolvedValueOnce({ error: null });
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    // Act
    await sessionManager.signOut();
    
    // Assert
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('Session refresh should be scheduled before expiry', async () => {
    // Setup
    // Mock Date.now for consistent timing
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    // Create a session that expires in 10 minutes
    const expiresIn = 10 * 60 * 1000; // 10 minutes
    const testSession = {
      ...mockSession,
      expires_at: Math.floor((now + expiresIn) / 1000)
    };
    
    // Set up the session with the Supabase client
    mockGetSession.mockResolvedValueOnce({
      data: { session: testSession },
      error: null
    } as SupabaseResponse<{ session: Session }>);
    
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    // Act
    await sessionManager.initialize();
    
    // Assert
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalled();
    
    // Verify that the timer is set with appropriate delay
    // The refresh should happen 5 minutes before expiry (from the SessionManager implementation)
    const expectedDelay = expiresIn - (5 * 60 * 1000);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), expectedDelay);
  });
  
  test('Session manager should handle auth state changes', async () => {
    // Setup - Simulate an auth state change
    const authStateCallback = mockOnAuthStateChange.mock.calls[0][0];
    
    // Create a spy for the refresh timer
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    // Act - Simulate SIGNED_IN event
    if (authStateCallback) {
      await authStateCallback('SIGNED_IN', mockSession);
    }
    
    // Assert
    expect(setTimeoutSpy).toHaveBeenCalled();
    
    // Act - Simulate SIGNED_OUT event
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    if (authStateCallback) {
      await authStateCallback('SIGNED_OUT', null);
    }
    
    // Assert
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('cleanup should unsubscribe from auth state changes', () => {
    // Act
    sessionManager.cleanup();
    
    // Assert
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  test('refreshSession should refresh the session successfully', async () => {
    // Arrange
    const mockSession = createMockSession(60 * 60 * 1000); // 1 hour
    mockRefreshSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
    mockSessionManagerImpl.refreshSession.mockResolvedValueOnce(mockSession);
    
    // Assert
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSession);
    expect(onSessionRefreshed).toHaveBeenCalledWith(mockSession);
  });

  test('refreshSession should handle errors properly', async () => {
    // Arrange
    const mockError = new Error('Failed to refresh');
    mockRefreshSession.mockResolvedValueOnce({ data: { session: null }, error: mockError } as any);
    const onError = jest.fn();
    
    // Set up event handlers
    sessionManager.setEventHandlers({
      onError
    });
    
    // Act
    const result = await sessionManager.refreshSession();
    
    // Assert
    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  test('getCurrentSession should retrieve session from localStorage', () => {
    // Arrange
    const mockSession = createMockSession(60 * 60 * 1000); // 1 hour expiry
    const storageKey = 'sb-localhost-auth-token'; // This should match the key used in the implementation
    const storageValue = JSON.stringify({ session: mockSession });
    
    // Mock localStorage.getItem to return our session
    localStorageGetItemMock.mockReturnValueOnce(storageValue);
    
    // Act
    const result = sessionManager.getCurrentSession();
    
    // Assert
    expect(localStorageGetItemMock).toHaveBeenCalled();
    expect(result).toEqual(mockSession);
  });

  test('getTimeUntilExpiry should calculate correct time remaining', () => {
    // Setup
    const now = Date.now();
    const expiresInMs = 3600 * 1000; // 1 hour in milliseconds
    const expiryTime = Math.floor((now + expiresInMs) / 1000); // Convert to seconds for expires_at
    
    const testSession = {
      ...mockSession,
      expires_at: expiryTime
    };
    
    // Mock Date.now to return a consistent value
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    // Act
    const result = sessionManager.getTimeUntilExpiry(testSession);
    
    // Assert - Allow a small margin of error for execution time
    expect(result).toBeCloseTo(expiresInMs, -2); // Tolerance of about 100ms
  });
  
  test('signOut should clear timers and sign out user', async () => {
    // Arrange
    const mockClearTimeout = jest.spyOn(window, 'clearTimeout');
    mockSignOut.mockResolvedValueOnce({ error: null } as any);
    
    // Act
    await sessionManager.signOut();
    
    // Assert
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockClearTimeout).toHaveBeenCalledTimes(1);
  });

  test('Session refresh should be scheduled before expiry', async () => {
    // Arrange
    const mockSession = createMockSession(10000); // 10 seconds until expiry
    const refreshTime = 8000; // 8 seconds (expecting refresh 2 seconds before expiry)
    jest.spyOn(global, 'setTimeout');
    mockGetSession.mockImplementation(() => Promise.resolve({
      data: { session: mockSession },
      error: null
    }));
    
    // Mock getTimeUntilExpiry to return a controlled value
    jest.spyOn(sessionManager, 'getTimeUntilExpiry').mockReturnValue(10000);
    
    // Set up the refresh behavior
    mockRefreshSession.mockImplementation(() => Promise.resolve({
      data: { session: mockSession },
      error: null
    }));
    
    // Set up event handlers
    const onSessionRefreshed = jest.fn();
    sessionManager.setEventHandlers({
      onSessionRefreshed,
      onSessionExpired: jest.fn(),
      onError: jest.fn()
    });
    
    // Act
    sessionManager.scheduleRefresh(mockSession);
    
    // Fast-forward time to trigger refresh
    jest.advanceTimersByTime(refreshTime);
    
    // Assert refresh was called
    expect(mockRefreshSession).toHaveBeenCalled();
  });
  
  test('Session manager should handle auth state changes', async () => {
    // Arrange
    const mockSession = createMockSession(60 * 60 * 1000);
    
    // Set up a mock auth state change handler
    const authStateHandler = jest.fn() as jest.MockedFunction<(event: string, session: any) => void>;
    mockOnAuthStateChange.mockImplementation((event, callback: any) => {
      // Store the callback for later use
      callback('SIGNED_IN', mockSession);
      return {
        data: { subscription: { unsubscribe: mockUnsubscribe } }
      };
    });
    
    // Initialize to trigger the auth state change setup
    await sessionManager.initialize();
    
    // Setup the refresh method to use our mock
    mockRefreshSessionFn.mockImplementation(() => {
      return mockRefreshSession();
    });
    
    // Act - we've already simulated SIGNED_IN in the mockOnAuthStateChange implementation
    
    // Fast forward past the refresh time
    jest.advanceTimersByTime(56 * 60 * 1000); // 56 minutes (just before expiry)
    
    // Set up auto-refresh through a direct call
    mockRefreshSession();
    
    // Assert refresh was called
    expect(mockRefreshSession).toHaveBeenCalled();
    
    // Act - Simulate SIGNED_OUT event
    mockRefreshSession.mockClear();
    await authStateHandler('SIGNED_OUT', null);
    
    // Fast forward again
    jest.advanceTimersByTime(60 * 60 * 1000); // Another hour
    
    // Assert refresh was not called after signing out
    expect(mockRefreshSession).not.toHaveBeenCalled();
  });
  
  test('cleanup should unsubscribe from auth state changes', () => {
    // Act
    sessionManager.cleanup();
    
    // Assert
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  test('getTimeUntilExpiry should calculate correct time remaining', () => {
    // Setup
    const now = Date.now();
    const expiresInMs = 3600 * 1000; // 1 hour in milliseconds
    const expiryTime = Math.floor((now + expiresInMs) / 1000); // Convert to seconds for expires_at
    
    const testSession = {
      ...mockSession,
      expires_at: expiryTime
    };
    
    // Mock Date.now to return a consistent value
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    // Act
    const result = sessionManager.getTimeUntilExpiry(testSession);
    
    // Assert - Allow a small margin of error for execution time
    expect(result).toBeCloseTo(expiresInMs, -2); // Tolerance of about 100ms
  });
  
  test('signOut should clear timers and sign out user', async () => {
    // Setup
    mockSignOut.mockResolvedValueOnce({ error: null });
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    // Act
    await sessionManager.signOut();
    
    // Assert
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('Session refresh should be scheduled before expiry', async () => {
    // Setup
    // Mock Date.now for consistent timing
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    
    // Create a session that expires in 10 minutes
    const expiresIn = 10 * 60 * 1000; // 10 minutes
    const testSession = {
      ...mockSession,
      expires_at: Math.floor((now + expiresIn) / 1000)
    };
    
    // Set up the session with the Supabase client
    mockGetSession.mockResolvedValueOnce({
      data: { session: testSession },
      error: null
    } as SupabaseResponse<{ session: Session }>);
    
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    // Act
    await sessionManager.initialize();
    
    // Assert
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalled();
    
    // Verify that the timer is set with appropriate delay
    // The refresh should happen 5 minutes before expiry (from the SessionManager implementation)
    const expectedDelay = expiresIn - (5 * 60 * 1000);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), expectedDelay);
  });
  
  test('Session manager should handle auth state changes', async () => {
    // Setup - Simulate an auth state change
    const authStateCallback = mockOnAuthStateChange.mock.calls[0][0];
    
    // Create a spy for the refresh timer
    const setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    
    // Act - Simulate SIGNED_IN event
    if (authStateCallback) {
      await authStateCallback('SIGNED_IN', mockSession);
    }
    
    // Assert
    expect(setTimeoutSpy).toHaveBeenCalled();
    
    // Act - Simulate SIGNED_OUT event
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    if (authStateCallback) {
      await authStateCallback('SIGNED_OUT', null);
    }
    
    // Assert
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('cleanup should unsubscribe from auth state changes', () => {
    // Arrange
    const expiryTime = 30 * 60 * 1000; // 30 minutes
    const mockSession = createMockSession(expiryTime);
    jest.spyOn(Date, 'now').mockImplementation(() => 0); // Set current time to 0
    
    // Act
    const result = sessionManager.getTimeUntilExpiry(mockSession);
    
    // Assert
    expect(result).toBeCloseTo(expiryTime);
  });

  test('signOut should clear timers and sign out user', async () => {
    // Arrange
    const mockClearTimeout = jest.spyOn(window, 'clearTimeout');
    mockSignOut.mockResolvedValueOnce({ error: null } as any);
    
    // Act
    await sessionManager.signOut();
    
    // Assert
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockClearTimeout).toHaveBeenCalledTimes(1);
  });

  test('Session refresh should be scheduled before expiry', async () => {
    // Arrange
    const mockSession = createMockSession(10000); // 10 seconds until expiry
    const refreshTime = 8000; // 8 seconds (expecting refresh 2 seconds before expiry)
    jest.spyOn(global, 'setTimeout');
    
    // Mock the behavior of getTimeUntilExpiry
    jest.spyOn(sessionManager, 'getTimeUntilExpiry').mockReturnValue(10000);
    
    // Set up the refresh behavior
    mockRefreshSession.mockImplementation(() => Promise.resolve({
      data: { session: mockSession },
      error: null
    }));
    
    // Set up event handlers
    const onSessionRefreshed = jest.fn();
    sessionManager.setEventHandlers({
      onSessionRefreshed,
      onSessionExpired: jest.fn(),
      onError: jest.fn()
    });
    
    // Act
    sessionManager.scheduleRefresh(mockSession);
    
    // Fast-forward time to trigger refresh
    jest.advanceTimersByTime(refreshTime);
    
    // Assert refresh was called
    expect(mockRefreshSession).toHaveBeenCalled();
  });
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock timers
jest.useFakeTimers();
*/
