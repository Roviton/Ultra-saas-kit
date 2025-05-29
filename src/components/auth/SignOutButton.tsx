'use client'

import { useState } from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { LogOut, AlertTriangle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth-context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SignOutButtonProps extends Omit<ButtonProps, 'onClick'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showIcon?: boolean
  showConfirmation?: boolean
}

export function SignOutButton({ 
  variant = 'outline', 
  showIcon = true,
  showConfirmation = true,
  children, 
  ...props 
}: SignOutButtonProps) {
  const { signOut, isAdmin, isDispatcher, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Choose a variant based on user role if not explicitly specified
  const roleBasedVariant = props.className?.includes('variant') ? variant : 
    isAdmin ? 'destructive' : 
    isDispatcher ? 'secondary' : 
    'outline';

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
      setIsConfirmOpen(false)
    }
  }

  if (showConfirmation) {
    return (
      <>
        <Button
          variant={roleBasedVariant}
          onClick={() => setIsConfirmOpen(true)}
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

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out from Ultra21</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out? Any unsaved changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleSignOut}
                disabled={isLoading}
                className={roleBasedVariant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing out...</span>
                  </span>
                ) : 'Sign out'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
  
  // Version without confirmation dialog
  return (
    <Button
      variant={roleBasedVariant}
      onClick={handleSignOut}
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
