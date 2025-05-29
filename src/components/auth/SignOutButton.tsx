'use client'

import { useState } from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/supabase/auth-context'

interface SignOutButtonProps extends Omit<ButtonProps, 'onClick'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showIcon?: boolean
}

export function SignOutButton({ 
  variant = 'outline', 
  showIcon = true, 
  children, 
  ...props 
}: SignOutButtonProps) {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Signing out...
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
