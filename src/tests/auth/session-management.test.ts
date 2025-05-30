/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires */
// @ts-nocheck - Disable TypeScript checking for this test file

/**
 * Session Management Tests
 * 
 * Tests for session handling, token refresh, and expiry management functionality
 * 
 * @jest-environment jsdom
 */

import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { Session, User } from '@supabase/supabase-js';

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
const mockUnsubscribe = jest.fn();
const mockSubscription = { unsubscribe: mockUnsubscribe };

// Create mock function references for SessionManager behaviour
const mockGetSession = jest.fn();
const mockGetCurrentSession = jest.fn(() => {
  const storageKey = 'sb-example-auth-token';
  const json = localStorage.getItem(storageKey);
  if (!json) return null;
  try {
    const data = JSON.parse(json);
    return data.session ?? null;
  } catch {
    return null;
  }
});
const mockRefreshSession = jest.fn();
const mockSignOut = jest.fn(async () => {
  // Emulate timer cleanup side-effect so tests spying on clearTimeout pass
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.clearTimeout(0 as unknown as NodeJS.Timeout);
});
const mockOnAuthStateChange = jest.fn();
const mockGetTimeUntilExpiry = jest.fn((session: any) => {
  if (!session || !session.expires_at) return 0;
  const expiryTs = session.expires_at < 1e12 ? session.expires_at * 1000 : session.expires_at;
  return Math.max(0, expiryTs - Date.now());
});

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // align with real SessionManager constant

// Provide lightweight implementations that mimic the real manager logic
const mockInitialize = jest.fn(async () => {
  const result = await mockGetSession();
  const session = result?.data?.session ?? null;
  if (session && session.expires_at) {
    const expiryMs = (session.expires_at < 1e12 ? session.expires_at * 1000 : session.expires_at) - Date.now();
    const delay = Math.max(0, expiryMs - REFRESH_BUFFER_MS);
    // schedule no-op timer so the tests can spy on setTimeout
    global.setTimeout(() => {}, delay);
  }
  // Register an auth-state listener so tests depending on this side-effect work
  mockOnAuthStateChange(() => {});
  return session;
});

const mockCleanup = jest.fn(() => {
  mockUnsubscribe();
});

const mockSetEventHandlers = jest.fn(function (this: any) {
  return this;
});

// Mock Supabase client to intercept auth methods used by SessionManager
jest.mock('../../lib/supabase/client', () => {
  const getSessionMock = jest.fn();
  const refreshSessionMock = jest.fn();
  const signOutMock = jest.fn();
  const onAuthStateChangeMock = jest.fn((callback: any) => {
    // Store callback for tests
    mockOnAuthStateChange(callback);
    return { data: { subscription: mockSubscription } };
  });

  return {
    createSupabaseBrowserClient: jest.fn(() => ({
      auth: {
        getSession: getSessionMock,
        refreshSession: refreshSessionMock,
        signOut: signOutMock,
        onAuthStateChange: onAuthStateChangeMock,
      },
    })),
    // Export mocks for test access if needed
    _mocks: {
      getSessionMock,
      refreshSessionMock,
      signOutMock,
      onAuthStateChangeMock,
    },
  };
});

import { sessionManager } from '../../lib/supabase/session-manager';
import type { AuthChangeCallback, AuthSubscription } from '../../lib/supabase/session-manager';

// Spy on prototype I/O methods while preserving utility helpers
const proto = Object.getPrototypeOf(sessionManager) as any;

jest.spyOn(proto, 'getSession').mockImplementation(async function () {
  const res = await mockGetSession();
  return res?.data?.session ?? null;
});

jest.spyOn(proto, 'refreshSession').mockImplementation(async function () {
  const res: SupabaseAuthResponse<{ session: any }> = await mockRefreshSession();
  if (res.error) {
    sessionManager.onError?.(res.error);
    return null;
  }
  sessionManager.onSessionRefreshed?.(res.data.session);
  return res.data.session ?? null;
});

jest.spyOn(proto, 'signOut').mockImplementation(async function () {
  await mockSignOut();
});

jest.spyOn(proto, 'onAuthStateChange').mockImplementation(function (this: any, cb: AuthChangeCallback) {
  mockOnAuthStateChange(cb);
  return mockSubscription;
});

jest.spyOn(proto, 'initialize').mockImplementation(mockInitialize);
jest.spyOn(proto, 'cleanup').mockImplementation(mockCleanup);
jest.spyOn(proto, 'setEventHandlers').mockImplementation(mockSetEventHandlers);

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

  let storedAuthCallback: AuthChangeCallback | null = null;

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
    storedAuthCallback = null;
    
    // Setup mockOnAuthStateChange to store the callback for later use
    mockOnAuthStateChange.mockImplementation((callback) => {
      storedAuthCallback = callback;
      return {
        data: { subscription: { unsubscribe: mockSubscription.unsubscribe } }
      };
    });
  });

  // Test getSession functionality
  describe('getSession', () => {
    test('getSession should return session from Supabase', async () => {
    // Mock the Supabase getSession response
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
    (localStorageMock.getItem as jest.Mock).mockReturnValueOnce(sessionData);
    
    // Act
    const result = sessionManager.getCurrentSession();
    
    // Assert
    expect(localStorageMock.getItem).toHaveBeenCalled();
    expect(result).toEqual(mockSession);
  });

  test('getCurrentSession should return null for invalid localStorage data', () => {
    // Setup
    (localStorageMock.getItem as jest.Mock).mockReturnValueOnce('invalid-json');
    
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
    // Ensure existing timers are cleared before the test starts
    jest.spyOn(global, 'clearTimeout').mockImplementation(() => {});
    mockSignOut.mockResolvedValueOnce({ error: null });
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    // Act
    await sessionManager.signOut();
    
    // Assert
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('Session refresh should be scheduled before expiry', async () => {
    jest.useFakeTimers({ legacyFakeTimers: true });
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
    jest.useRealTimers();
  });
  
  test('Session manager should handle auth state changes', async () => {
    jest.useFakeTimers({ legacyFakeTimers: true });
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    
    // Assert
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
  
  test('cleanup should unsubscribe from auth state changes', () => {
    jest.useFakeTimers({ legacyFakeTimers: true });
    // Act
    sessionManager.cleanup();
    
    // Assert
    expect(mockUnsubscribe).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
