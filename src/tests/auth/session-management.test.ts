/**
 * Session Management and Token Handling Tests
 * Tests session persistence, token refresh, and expiry handling
 */
import { SessionManager } from '@/lib/supabase/session-manager'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: jest.fn()
}))

// Mock URL constructor
global.URL = jest.fn().mockImplementation((url) => ({
  hostname: 'xfcjarelwsobyglvwajl.supabase.co'
}))

// Mock setTimeout and clearTimeout
jest.useFakeTimers()

describe('Session Manager', () => {
  let mockSupabase: any
  let sessionManager: SessionManager
  let mockSession: Partial<Session>
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Create a mock session
    mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000, // 1 hour from now
      user: { id: 'user-123', email: 'test@example.com' }
    }
    
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({ 
          data: { session: mockSession as Session } 
        }),
        refreshSession: jest.fn().mockResolvedValue({
          data: { session: { ...mockSession, access_token: 'new-access-token' } as Session },
          error: null
        }),
        signOut: jest.fn().mockResolvedValue({}),
        onAuthStateChange: jest.fn().mockReturnValue({ 
          data: { subscription: { unsubscribe: jest.fn() } }
        })
      }
    }
    
    // Mock the Supabase client creation
    (createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
    
    // Setup localStorage with a session
    localStorageMock.setItem(
      'sb-xfcjarelwsobyglvwajl-auth-token',
      JSON.stringify({ session: mockSession })
    )
    
    // Create new session manager instance for each test
    sessionManager = new SessionManager()
  })
  
  test('initializes with current session', async () => {
    const mockOnSessionRefreshed = jest.fn()
    sessionManager.setEventHandlers({
      onSessionRefreshed: mockOnSessionRefreshed
    })
    
    const session = await sessionManager.initialize()
    
    expect(session).toEqual(mockSession)
    expect(mockSupabase.auth.getSession).toHaveBeenCalled()
  })
  
  test('gets current session from localStorage', () => {
    const session = sessionManager.getCurrentSession()
    
    expect(session).toEqual(mockSession)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('sb-xfcjarelwsobyglvwajl-auth-token')
  })
  
  test('refreshes session', async () => {
    const mockOnSessionRefreshed = jest.fn()
    sessionManager.setEventHandlers({
      onSessionRefreshed: mockOnSessionRefreshed
    })
    
    await sessionManager.refreshSession()
    
    expect(mockSupabase.auth.refreshSession).toHaveBeenCalled()
    expect(mockOnSessionRefreshed).toHaveBeenCalledWith({ 
      ...mockSession, 
      access_token: 'new-access-token' 
    })
  })
  
  test('signs out', async () => {
    await sessionManager.signOut()
    
    expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  })
  
  test('calculates time until expiry correctly', () => {
    const futureTime = Date.now() + 1000000
    const mockSessionWithExpiry = {
      ...mockSession,
      expires_at: futureTime
    }
    
    const timeUntilExpiry = sessionManager.getTimeUntilExpiry(mockSessionWithExpiry as Session)
    
    // Should be close to 1000000 ms (with some small difference due to test execution time)
    expect(timeUntilExpiry).toBeGreaterThan(990000)
    expect(timeUntilExpiry).toBeLessThanOrEqual(1000000)
  })
  
  test('sets up refresh timer based on expiry', async () => {
    const futureTime = Date.now() + 1000000
    const mockSessionWithExpiry = {
      ...mockSession,
      expires_at: futureTime
    }
    
    // Mock refreshSession method
    const refreshSessionSpy = jest.spyOn(sessionManager, 'refreshSession')
    
    // Initialize with session that expires in the future
    mockSupabase.auth.getSession.mockResolvedValueOnce({ 
      data: { session: mockSessionWithExpiry as Session } 
    })
    
    await sessionManager.initialize()
    
    // Fast-forward time past the refresh buffer but before expiry
    jest.advanceTimersByTime(700000) // 700 seconds, just before the 5-minute buffer
    
    // Should not have called refresh yet
    expect(refreshSessionSpy).not.toHaveBeenCalled()
    
    // Fast-forward to after refresh time (5 minutes before expiry)
    jest.advanceTimersByTime(300000) // Another 300 seconds, past the buffer
    
    // Should have called refresh now
    expect(refreshSessionSpy).toHaveBeenCalled()
  })
  
  test('handles session expiry correctly', async () => {
    const expiredTime = Date.now() - 10000
    const mockExpiredSession = {
      ...mockSession,
      expires_at: expiredTime
    }
    
    const mockOnSessionExpired = jest.fn()
    sessionManager.setEventHandlers({
      onSessionExpired: mockOnSessionExpired
    })
    
    // Initialize with already expired session
    mockSupabase.auth.getSession.mockResolvedValueOnce({ 
      data: { session: mockExpiredSession as Session } 
    })
    
    await sessionManager.initialize()
    
    // Should call onSessionExpired callback
    expect(mockOnSessionExpired).toHaveBeenCalled()
  })
  
  test('cleans up timers and subscriptions', () => {
    // Setup timers
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    
    // Initialize with future session to set up timers
    const futureTime = Date.now() + 1000000
    const mockSessionWithExpiry = {
      ...mockSession,
      expires_at: futureTime
    }
    
    mockSupabase.auth.getSession.mockResolvedValueOnce({ 
      data: { session: mockSessionWithExpiry as Session } 
    })
    
    // Call cleanup
    sessionManager.cleanup()
    
    // Should clear timers
    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
  
  test('handles error during session refresh', async () => {
    // Mock refresh error
    mockSupabase.auth.refreshSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('Refresh failed')
    })
    
    const mockOnError = jest.fn()
    sessionManager.setEventHandlers({
      onError: mockOnError
    })
    
    const result = await sessionManager.refreshSession()
    
    expect(result).toBeNull()
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Error))
  })
})
