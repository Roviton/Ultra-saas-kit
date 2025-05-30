'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  useAuth, 
  useAuthState, 
  useIsAdmin, 
  useIsDispatcher, 
  useIsDriver, 
  useIsCustomer,
  useProfile,
  useAuthActions
} from '@/lib/supabase/auth-context'
import { UserRole } from '@/lib/roles'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

/**
 * AuthStateExample - A component that demonstrates how to use the enhanced authentication hooks
 * This serves as a reference implementation for using the authentication system
 */
export default function AuthStateExample() {
  // Basic auth context (contains everything)
  const auth = useAuth()
  
  // Specialized authentication state hooks
  const { isAuthenticated, isLoading, isVerified } = useAuthState()
  
  // Role-specific hooks for simple role checks
  const isAdmin = useIsAdmin()
  const isDispatcher = useIsDispatcher()
  const isDriver = useIsDriver()
  const isCustomer = useIsCustomer()
  
  // Profile data
  const profile = useProfile()
  
  // Authentication actions
  const { signOut, refreshProfile } = useAuthActions()
  
  // Handler for session refresh
  const handleRefreshSession = async () => {
    const success = await auth.refreshSession()
    if (success) {
      toast.success('Session refreshed successfully')
    } else {
      toast.error('Failed to refresh session')
    }
  }
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication State</CardTitle>
          <CardDescription>Loading authentication state...</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  // If not authenticated, show a sign-in message
  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication State</CardTitle>
          <CardDescription>You are not signed in</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.href = '/auth/signin'}>
            Sign In
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  // User is authenticated, show their state
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication State</CardTitle>
        <CardDescription>Signed in as {profile?.email}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Authentication Status:</span>
            <Badge variant="outline" className="bg-green-50">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
              Authenticated
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Email Verification:</span>
            {isVerified ? (
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50">
                <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                Not Verified
              </Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Role:</span>
            <Badge variant="secondary">{profile?.role || 'None'}</Badge>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="text-sm font-medium mb-2">Role Access:</div>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant={isAdmin ? "default" : "outline"}>Admin</Badge>
            <Badge variant={isDispatcher ? "default" : "outline"}>Dispatcher</Badge>
            <Badge variant={isDriver ? "default" : "outline"}>Driver</Badge>
            <Badge variant={isCustomer ? "default" : "outline"}>Customer</Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefreshSession}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Session
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  )
}
