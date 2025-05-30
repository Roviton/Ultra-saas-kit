import { createSupabaseBrowserClient } from './client'
import { Session } from '@supabase/supabase-js'

/**
 * Session Manager for handling auth session persistence, expiry, and refresh
 * Implements secure session storage strategy and automatic token refresh
 */
export class SessionManager {
  private supabase = createSupabaseBrowserClient()
  private refreshTimer: NodeJS.Timeout | null = null
  private expiryWarningTimer: NodeJS.Timeout | null = null
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000 // Refresh 5 minutes before expiry
  private readonly WARNING_BUFFER_MS = 2 * 60 * 1000 // Warn 2 minutes before expiry

  // Event callbacks
  private onSessionExpiringSoon?: (expiresIn: number) => void
  private onSessionRefreshed?: (session: Session) => void
  private onSessionExpired?: () => void
  private onError?: (error: Error) => void

  constructor() {
    // Initialize listeners for session changes
    this.setupSessionChangeListener()
  }

  /**
   * Set up event handlers for session events
   */
  public setEventHandlers({
    onSessionExpiringSoon,
    onSessionRefreshed,
    onSessionExpired,
    onError
  }: {
    onSessionExpiringSoon?: (expiresIn: number) => void
    onSessionRefreshed?: (session: Session) => void
    onSessionExpired?: () => void
    onError?: (error: Error) => void
  }) {
    this.onSessionExpiringSoon = onSessionExpiringSoon
    this.onSessionRefreshed = onSessionRefreshed
    this.onSessionExpired = onSessionExpired
    this.onError = onError
    return this
  }

  /**
   * Initialize the session manager with the current session
   * Sets up refresh and expiry timers
   */
  public async initialize(): Promise<Session | null> {
    try {
      const { data } = await this.supabase.auth.getSession()
      const session = data.session
      
      if (session) {
        this.setupRefreshTimer(session)
        return session
      }
      return null
    } catch (error) {
      this.handleError(error as Error)
      return null
    }
  }

  /**
   * Manually refresh the session
   */
  public async refreshSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) {
        throw error
      }
      
      if (data.session) {
        if (this.onSessionRefreshed) {
          this.onSessionRefreshed(data.session)
        }
        return data.session
      }
      
      return null
    } catch (error) {
      this.handleError(error as Error)
      return null
    }
  }

  /**
   * Get the current session synchronously from storage
   */
  public getCurrentSession(): Session | null {
    try {
      // We can't get the session synchronously with Supabase v2
      // Instead we'll retrieve from localStorage directly
      const storageKey = 'sb-' + new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').hostname.split('.')[0] + '-auth-token'
      const json = localStorage.getItem(storageKey)
      if (!json) return null
      
      try {
        const data = JSON.parse(json)
        return data.session as Session
      } catch {
        return null
      }
    } catch (error) {
      this.handleError(error as Error)
      return null
    }
  }

  /**
   * Legacy helper retained for backward-compat test suites.
   * Performs a one-off async fetch of the current session without
   * scheduling timers or side-effects.
   */
  public async getSession(): Promise<Session | null> {
    try {
      const { data } = await this.supabase.auth.getSession()
      return data.session ?? null
    } catch {
      return null
    }
  }

  /**
   * Calculate time remaining in session
   * @param session Active session
   * @returns Time in milliseconds until session expires
   */
  public getTimeUntilExpiry(session: Session): number {
    if (!session || !session.expires_at) return 0
    // Supabase `expires_at` is a Unix timestamp in **seconds**. Convert to milliseconds before comparison.
    const expiryTimestamp = typeof session.expires_at === 'number'
      ? (session.expires_at < 1e12 ? session.expires_at * 1000 : session.expires_at)
      : new Date(session.expires_at).getTime()
    const currentTime = Date.now()
    return Math.max(0, expiryTimestamp - currentTime)
  }

  /**
   * Sign out user and clear session data
   */
  public async signOut(): Promise<void> {
    try {
      this.clearTimers()
      await this.supabase.auth.signOut()
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  /**
   * Cleanup resources when component unmounts
   */
  public cleanup(): void {
    this.clearTimers()
  }

  /**
   * Set up listener for auth state changes
   */
  private setupSessionChangeListener(): void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            this.setupRefreshTimer(session)
          }
        } else if (event === 'SIGNED_OUT') {
          this.clearTimers()
          if (this.onSessionExpired) {
            this.onSessionExpired()
          }
        }
      }
    )

    // Store the subscription so we can unsubscribe later
    this.cleanup = () => {
      subscription.unsubscribe()
      this.clearTimers()
    }
  }

  /**
   * Set up timers for session refresh and expiry warning
   */
  private setupRefreshTimer(session: Session): void {
    this.clearTimers()
    
    const timeUntilExpiry = this.getTimeUntilExpiry(session)
    
    if (timeUntilExpiry <= 0) {
      if (this.onSessionExpired) {
        this.onSessionExpired()
      }
      return
    }

    // Set timer to refresh session before it expires
    const refreshTime = timeUntilExpiry - this.REFRESH_BUFFER_MS
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        await this.refreshSession()
      }, refreshTime)
    } else {
      // If we're already within the refresh buffer, refresh immediately
      this.refreshSession()
    }

    // Set timer to warn user before session expires
    const warningTime = timeUntilExpiry - this.WARNING_BUFFER_MS
    if (warningTime > 0 && this.onSessionExpiringSoon) {
      this.expiryWarningTimer = setTimeout(() => {
        if (this.onSessionExpiringSoon) {
          this.onSessionExpiringSoon(this.WARNING_BUFFER_MS)
        }
      }, warningTime)
    }
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    
    if (this.expiryWarningTimer) {
      clearTimeout(this.expiryWarningTimer)
      this.expiryWarningTimer = null
    }
  }

  /**
   * Handle errors in session management
   */
  private handleError(error: Error): void {
    console.error('Session management error:', error)
    if (this.onError) {
      this.onError(error)
    }
  }
}

// Create a singleton instance for app-wide usage
export const sessionManager = new SessionManager()

// Hook for using the session manager in components
export function useSessionManager() {
  return sessionManager
}
