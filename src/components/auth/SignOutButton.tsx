'use client'

import { useState } from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface SignOutButtonProps extends Omit<ButtonProps, 'onClick'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showIcon?: boolean
  showConfirmation?: boolean
}

/**
 * SignOutButton component that handles user sign-out using Clerk
 * Uses standard UI components to avoid dependency on @radix-ui/react-alert-dialog
 */
export function SignOutButton({ 
  variant = 'outline', 
  showIcon = true,
  showConfirmation = true,
  children, 
  ...props 
}: SignOutButtonProps) {
  const { signOut } = useClerk()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmVisible, setIsConfirmVisible] = useState(false)

  // Use the provided variant since we don't have role-based variants with Clerk yet
  const buttonVariant = variant

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
      await signOut(() => {
        // Redirect to home page after sign out
        router.push('/')
      })
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
            variant={buttonVariant} 
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
      variant={buttonVariant}
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
