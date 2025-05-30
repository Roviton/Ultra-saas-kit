'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Chat from '@/components/dashboard/Chat'
import { useAuth } from '@/lib/supabase/auth-context'
import { AdminOnly, DispatcherOnly, DriverOnly, CustomerOnly } from '@/components/auth/RoleProtection'
import { useRoleProtection } from '@/hooks/use-role-protection'

export default function Dashboard() {
  // Use our auth hook to get profile and user info
  const { user, profile } = useAuth();
  
  // Use our role protection hook for role-based UI
  const { userRole, isAdmin, isDispatcher } = useRoleProtection();
  
  // Calculate welcome message based on user role
  const welcomeMessage = useMemo(() => {
    if (!profile) return 'Welcome to the Ultra21 platform';
    
    const firstName = profile.firstName || '';
    const name = firstName || profile.email?.split('@')[0] || 'there';
    
    if (isAdmin()) {
      return `Welcome, Admin ${name}! You have complete access to the freight dispatch platform.`;
    } else if (isDispatcher()) {
      return `Welcome, Dispatcher ${name}! You're ready to manage freight operations.`;
    } else {
      return `Welcome, ${name}! Thank you for using the Ultra21 freight dispatch platform.`;
    }
  }, [profile, isAdmin, isDispatcher]);
  
  // Helper function to format date
  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ultra21 Dashboard</h1>
        <p className="mt-1 text-white/60">
          {welcomeMessage} | {formatDate()}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Welcome Section */}
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Freight Dispatch Platform
          </h2>
          
          <p className="text-white/60 mb-4">
            Welcome to the Ultra21 freight dispatch platform. Use the navigation menu to access your authorized features.
          </p>
          
          {/* Role-specific quick action section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white/90 mb-2">Quick Actions</h3>
            
            {/* Admin-only buttons */}
            <AdminOnly>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md text-sm">
                  Manage Users
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md text-sm">
                  Analytics Dashboard
                </button>
                <button className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-md text-sm">
                  Organization Settings
                </button>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-md text-sm">
                  Financial Reports
                </button>
              </div>
            </AdminOnly>
            
            {/* Dispatcher-only buttons (visible to both dispatchers and admins) */}
            <DispatcherOnly>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md text-sm">
                  Create New Load
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md text-sm">
                  Assign Driver
                </button>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-md text-sm">
                  Track Shipment
                </button>
                <button className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-md text-sm">
                  Manage Schedule
                </button>
              </div>
            </DispatcherOnly>
            
            {/* Universal actions for all roles */}
            {!isAdmin() && !isDispatcher() && (
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-md text-sm">
                  View Profile
                </button>
                <button className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-md text-sm">
                  Notification Settings
                </button>
              </div>
            )}
          </div>
          
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-lg font-medium text-white/90 mb-2">Your Role: <span className="capitalize text-yellow-400">{userRole || 'User'}</span></h3>
            <p className="text-white/60 mb-4">
              Your access level determines which features and data you can interact with.
            </p>
          </div>
        </div>

        {/* Chat UI */}
        <Chat />
      </div>
      
      {/* Role-specific sections */}
      <AdminOnly>
        <div className="bg-[#111111]/70 border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            <span className="text-yellow-400 mr-2">Admin</span> Dashboard Analytics
          </h2>
          <p className="text-white/80">
            This section is only visible to administrators. Here you can view key performance metrics
            and company-wide analytics for the freight dispatch platform.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-[#222222] p-4 rounded-lg">
              <div className="text-3xl font-bold text-white">287</div>
              <div className="text-white/60 text-sm">Active Loads</div>
            </div>
            <div className="bg-[#222222] p-4 rounded-lg">
              <div className="text-3xl font-bold text-white">43</div>
              <div className="text-white/60 text-sm">Active Drivers</div>
            </div>
            <div className="bg-[#222222] p-4 rounded-lg">
              <div className="text-3xl font-bold text-white">$95K</div>
              <div className="text-white/60 text-sm">Monthly Revenue</div>
            </div>
          </div>
        </div>
      </AdminOnly>
      
      <DispatcherOnly>
        <div className="bg-[#111111]/70 border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            <span className="text-blue-400 mr-2">Dispatcher</span> Current Operations
          </h2>
          <p className="text-white/80">
            This section is visible to dispatchers and administrators. Track active loads,
            driver locations, and manage the dispatch schedule from here.
          </p>
          <div className="mt-4">
            <div className="bg-[#222222] p-4 rounded-lg">
              <h3 className="text-white font-medium">Today's Schedule</h3>
              <ul className="mt-2 text-white/70 space-y-1">
                <li className="flex justify-between">
                  <span>Chicago to Detroit</span>
                  <span>08:00 AM</span>
                </li>
                <li className="flex justify-between">
                  <span>Atlanta to Miami</span>
                  <span>10:30 AM</span>
                </li>
                <li className="flex justify-between">
                  <span>Dallas to Houston</span>
                  <span>02:15 PM</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DispatcherOnly>
      
      <DriverOnly>
        <div className="bg-[#111111]/70 border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            <span className="text-green-400 mr-2">Driver</span> Assignment Dashboard
          </h2>
          <p className="text-white/80">
            This section is visible to drivers and management. View your current and upcoming 
            assignments, track deliveries, and manage your schedule.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#222222] p-4 rounded-lg">
              <h3 className="text-white font-medium">Current Assignment</h3>
              <div className="mt-2 text-white/70">
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Route:</span>
                  <span>Chicago to Detroit</span>
                </div>
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Pickup:</span>
                  <span>May 30, 08:00 AM</span>
                </div>
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Delivery:</span>
                  <span>May 30, 02:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Status:</span>
                  <span className="text-yellow-400">In Progress</span>
                </div>
                <div className="mt-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md text-sm w-full">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#222222] p-4 rounded-lg">
              <h3 className="text-white font-medium">Next Assignment</h3>
              <div className="mt-2 text-white/70">
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Route:</span>
                  <span>Detroit to Cleveland</span>
                </div>
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Pickup:</span>
                  <span>May 30, 04:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Delivery:</span>
                  <span>May 30, 08:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-white/10 py-1">
                  <span className="font-medium">Status:</span>
                  <span className="text-blue-400">Scheduled</span>
                </div>
                <div className="mt-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md text-sm w-full">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DriverOnly>
      
      <CustomerOnly>
        <div className="bg-[#111111]/70 border border-white/5 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            <span className="text-amber-400 mr-2">Customer</span> Shipment Dashboard
          </h2>
          <p className="text-white/80">
            Track your shipments, schedule new deliveries, and manage your account from this customer dashboard.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="bg-[#222222] p-4 rounded-lg">
              <h3 className="text-white font-medium">Active Shipments</h3>
              <div className="mt-2">
                <table className="w-full text-white/70">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 text-left">ID</th>
                      <th className="py-2 text-left">From</th>
                      <th className="py-2 text-left">To</th>
                      <th className="py-2 text-left">Status</th>
                      <th className="py-2 text-left">ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="py-2">SH-1234</td>
                      <td className="py-2">Chicago</td>
                      <td className="py-2">Detroit</td>
                      <td className="py-2 text-yellow-400">In Transit</td>
                      <td className="py-2">May 30, 2:00 PM</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-2">SH-1235</td>
                      <td className="py-2">Atlanta</td>
                      <td className="py-2">Miami</td>
                      <td className="py-2 text-green-400">Loading</td>
                      <td className="py-2">May 31, 9:00 AM</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-3 flex justify-end">
                  <button className="bg-amber-600 hover:bg-amber-700 text-white p-2 rounded-md text-sm">
                    Schedule New Shipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomerOnly>
    </div>
  )
} 