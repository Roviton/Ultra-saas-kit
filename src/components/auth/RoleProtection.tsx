'use client'

import { ReactNode, useEffect } from 'react'
import { useRoleProtection } from '@/hooks/use-role-protection'
import { UserRole } from '@/lib/roles'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface RoleProtectionProps {
  /**
   * The content to render if the user is authorized
   */
  children: ReactNode
  
  /**
   * Array of roles that can access this content
   */
  allowedRoles?: UserRole[]
  
  /**
   * Custom redirect path for unauthorized users (defaults to /dashboard/unauthorized)
   */
  redirectTo?: string
  
  /**
   * Optional fallback component to render while checking authorization
   */
  fallback?: ReactNode
}

/**
 * A component that protects content based on user roles
 * Use this to wrap page components or sections that require specific roles
 */
export function RoleProtection({
  children,
  allowedRoles,
  redirectTo,
  fallback
}: RoleProtectionProps) {
  const { isAuthorized, isLoading } = useRoleProtection(allowedRoles, redirectTo)
  const router = useRouter()

  // If authorization check is complete and user is not authorized
  useEffect(() => {
    if (!isLoading && isAuthorized === false && redirectTo) {
      router.push(redirectTo)
    }
  }, [isAuthorized, isLoading, redirectTo, router])

  // While loading, show fallback or loading spinner
  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    )
  }

  // If authorized, render children
  if (isAuthorized) {
    return <>{children}</>
  }

  // By default, render nothing (redirect will happen in the useEffect)
  return null
}

/**
 * A component that conditionally renders content based on user roles
 * Unlike RoleProtection, this doesn't redirect, it just conditionally renders
 */
export function RoleGated({
  children,
  allowedRoles,
  fallback = null
}: {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}) {
  const { canPerform, isLoading } = useRoleProtection()
  
  if (isLoading) {
    return null
  }
  
  if (canPerform(allowedRoles)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

/**
 * A component that only renders for admin users
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGated allowedRoles={['admin']} fallback={fallback}>{children}</RoleGated>
}

/**
 * A component that only renders for dispatcher users (and admins)
 */
export function DispatcherOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <RoleGated allowedRoles={['admin', 'dispatcher']} fallback={fallback}>{children}</RoleGated>
}
