'use client'

import { useEffect, useState } from 'react'
import { useSessionManager } from '@/lib/supabase/session-manager'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

/**
 * SessionExpiryAlert - Component to display notifications when a user's session is about to expire
 * Offers options to refresh the session or sign out
 */
export function SessionExpiryAlert() {
  const [open, setOpen] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const sessionManager = useSessionManager()
  const router = useRouter()

  useEffect(() => {
    // Set up event handlers for session expiry
    sessionManager.setEventHandlers({
      onSessionExpiringSoon: (expiresIn) => {
        setTimeRemaining(expiresIn)
        setOpen(true)
      },
      onSessionRefreshed: () => {
        setOpen(false)
        setIsRefreshing(false)
        toast.success('Your session has been refreshed successfully')
      },
      onSessionExpired: () => {
        toast.error('Your session has expired', {
          description: 'Please sign in again to continue',
          action: {
            label: 'Sign In',
            onClick: () => router.push('/auth/signin')
          }
        })
        setOpen(false)
        router.push('/auth/signin')
      },
      onError: (error) => {
        setIsRefreshing(false)
        toast.error('Failed to refresh session', {
          description: error.message
        })
      }
    })

    // Initialize session manager
    sessionManager.initialize()

    // Clean up on unmount
    return () => {
      sessionManager.cleanup()
    }
  }, [router])

  // Handle manual session refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await sessionManager.refreshSession()
  }

  // Handle sign out
  const handleSignOut = async () => {
    await sessionManager.signOut()
    router.push('/auth/signin')
  }

  // Format remaining time nicely
  const formatTimeRemaining = (ms: number): string => {
    if (!ms) return '0 seconds'
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds} seconds`
    return `${Math.floor(seconds / 60)} minutes and ${seconds % 60} seconds`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire in {timeRemaining ? formatTimeRemaining(timeRemaining) : 'a few moments'}.
            Would you like to stay signed in?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Stay Signed In'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
