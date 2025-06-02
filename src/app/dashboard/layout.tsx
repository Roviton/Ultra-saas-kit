'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  UserCircleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  TruckIcon,
} from '@heroicons/react/24/outline'
import Header from '@/components/dashboard/Header'

// Updated interface to use pathname literal types for Next.js 15 compatibility
interface NavItem {
  name: string
  href: string
  icon: typeof HomeIcon
}

// Define navigation items
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
  const pathname = usePathname()

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
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              )
            })}
            
            {/* Admin navigation temporarily removed until authentication is set up */}
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