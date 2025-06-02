'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ShieldAlert, ArrowLeft, HomeIcon } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import Image from 'next/image'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { profile } = useAuth()
  
  // Get the user's role
  const userRole = profile?.role || 'user'

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 bg-gray-900">
      {/* Ultra21 Logo */}
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center justify-center space-x-2">
          <Image src="/logo.svg" alt="Ultra21" width={40} height={40} priority />
          <span className="text-white font-bold text-2xl">Ultra<span className="text-yellow-400">21</span></span>
        </Link>
      </div>
      
      <div className="w-full max-w-md mx-auto text-center space-y-6 bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-lg">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-900/30 p-4 border border-red-700">
            <ShieldAlert className="w-16 h-16 text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white">
          Access Restricted
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            Your current role <span className="font-semibold capitalize text-yellow-400">{userRole}</span> doesn't 
            have permission to access this area of the Ultra21 freight dispatch platform.
          </p>
          
          <div className="bg-gray-700/40 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-gray-300 mb-2">About Role-Based Access</h3>
            <ul className="text-sm text-gray-400 list-disc ml-5 space-y-1">
              <li>Different roles have different levels of access</li>
              <li>Admin users have access to all areas</li>
              <li>Dispatcher users have access to load management</li>
              <li>Contact your administrator to request access changes</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full"
            variant="default"
          >
            <HomeIcon className="w-4 h-4 mr-2" /> Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
