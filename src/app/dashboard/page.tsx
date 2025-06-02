'use client'

import { useState } from 'react'
import Chat from '@/components/dashboard/Chat'

export default function Dashboard() {
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
  
  // Placeholder welcome message until authentication is implemented
  const welcomeMessage = 'Welcome to the Ultra21 platform';

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
            Welcome to the Ultra21 freight dispatch platform. Use the navigation menu to access features.
          </p>
          
          {/* Quick Actions Section - Will be role-based after auth implementation */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white/90 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-md text-sm">
                View Dashboard
              </button>
              <button className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-md text-sm">
                Settings
              </button>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-lg font-medium text-white/90 mb-2">Your Role: <span className="capitalize text-yellow-400">User</span></h3>
            <p className="text-white/60 mb-4">
              Role-based access will be implemented with Clerk authentication.
            </p>
          </div>
        </div>

        {/* Chat UI */}
        <Chat />
      </div>
      
      {/* Placeholder for role-specific content */}
      <div className="bg-[#111111]/70 border border-white/5 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Dashboard Overview
        </h2>
        <p className="text-white/80">
          This section will display role-specific content after Clerk authentication is implemented.
          Different user roles will see different content and functionality based on their permissions.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-[#222222] p-4 rounded-lg">
            <div className="text-3xl font-bold text-white">--</div>
            <div className="text-white/60 text-sm">Active Loads</div>
          </div>
          <div className="bg-[#222222] p-4 rounded-lg">
            <div className="text-3xl font-bold text-white">--</div>
            <div className="text-white/60 text-sm">Active Drivers</div>
          </div>
          <div className="bg-[#222222] p-4 rounded-lg">
            <div className="text-3xl font-bold text-white">--</div>
            <div className="text-white/60 text-sm">Monthly Revenue</div>
          </div>
        </div>
      </div>
    </div>
  )
} 