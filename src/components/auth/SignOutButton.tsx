'use client'

import { useState } from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth-context'

interface SignOutButtonProps extends Omit<ButtonProps, 'onClick'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showIcon?: boolean
  showConfirmation?: boolean
}

/**
 * SignOutButton component that handles user sign-out
 * Uses standard UI components to avoid dependency on @radix-ui/react-alert-dialog
 */
export function SignOutButton({ 
  variant = 'outline', 
  showIcon = true,
  showConfirmation = true,
  children, 
  ...props 
}: SignOutButtonProps) {
  const { signOut, isAdmin, isDispatcher } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)

  // Choose a variant based on user role if not explicitly specified
  const roleBasedVariant = props.className?.includes('variant') ? variant : 
    isAdmin ? 'destructive' : 
    isDispatcher ? 'secondary' : 
    'outline';

  const handleSignOutClick = () => {
    if (showConfirmation) {
      setIsConfirmVisible(true);
    } else {
      handleSignOut();
    }
  }
  
  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
      setIsConfirmVisible(false)
    }
  }

  if (showConfirmation && isConfirmVisible) {
    // Show an inline confirmation UI instead of using AlertDialog
    return (
      <div className="space-y-4 border rounded-lg p-4 bg-background">
        <div className="flex flex-col space-y-2">
          <h4 className="font-medium text-base">Sign out from Ultra21</h4>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to sign out? Any unsaved changes will be lost.
          </p>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button 
            variant="outline" 
            onClick={() => setIsConfirmVisible(false)}
            size="sm"
          >
            Cancel
          </Button>
          <Button 
            variant={roleBasedVariant} 
            onClick={handleSignOut}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing out...</span>
              </span>
            ) : 'Sign out'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant={roleBasedVariant}
      onClick={showConfirmation ? handleSignOutClick : handleSignOut}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Signing out...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          {showIcon && <LogOut className="h-4 w-4" />}
          {children || 'Sign out'}
        </span>
      )}
    </Button>
  )
}
