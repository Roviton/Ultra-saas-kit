'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import Header from '@/components/dashboard/Header'

interface NavItem {
  name: string
  href: string
  icon: typeof HomeIcon
}

const navigation: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Freight', href: '/dashboard/freight', icon: TruckIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  { name: 'Documents', href: '/dashboard/documents', icon: DocumentTextIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated, userRole } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/sign-in')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        {/* Sidebar */}
        <div className="fixed left-0 w-64 h-[calc(100vh-4rem)] bg-[#111111] border-r border-white/5 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
            
            {/* Admin-only navigation item */}
            {userRole === 'admin' && (
              <Link
                href="/dashboard/admin"
                className={`
                  flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-4
                  ${pathname === '/dashboard/admin' 
                    ? 'bg-red-900/30 text-red-400' 
                    : 'text-red-400/70 hover:bg-red-900/20 hover:text-red-400'
                  }
                `}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
} 