'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserCircleIcon, ShieldCheckIcon, TruckIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { UserRole } from '@/lib/roles'

interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string | null
  website?: string
  email?: string
  role?: UserRole
  organization_id?: string | null
  first_name?: string
  last_name?: string
}

export default function ProfileSettings() {
  const { user, profile: authProfile, isLoading: authLoading, isAdmin, refreshProfile } = useAuth()
  const [profileData, setProfileData] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchProfile = async () => {
    try {
      setError(null)
      
      // Use the user from auth context instead of fetching again
      if (!user) {
        console.log('No user found in auth context, redirecting to auth')
        router.push('/auth')
        return
      }

      console.log('User found:', user.id)

      // First check if profile exists
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, website, email, role, organization_id, first_name, last_name')
        .eq('id', user.id)

      console.log('Profile query response:', { data: profiles, error: profileError })

      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error(`Profile error: ${profileError.message}`)
      }

      // Handle multiple profiles case
      if (profiles && profiles.length > 1) {
        console.log('Multiple profiles found, cleaning up...')
        
        // Delete duplicate profiles
        const [keepProfile, ...duplicates] = profiles
        if (duplicates.length > 0) {
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .in('id', duplicates.map(p => p.id))
          
          if (deleteError) {
            console.error('Error cleaning up duplicate profiles:', deleteError)
          }
        }
        
        if (keepProfile) {
          setProfileData({
            id: keepProfile.id,
            username: keepProfile.username,
            full_name: keepProfile.full_name,
            avatar_url: keepProfile.avatar_url,
            website: keepProfile.website,
            email: keepProfile.email,
            role: keepProfile.role,
            organization_id: keepProfile.organization_id,
            first_name: keepProfile.first_name,
            last_name: keepProfile.last_name
          })
        }
      }
      // Handle no profile case
      else if (!profiles || profiles.length === 0) {
        console.log('No profile found, creating new profile...')
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: user.id,
            username: '',
            full_name: '',
            avatar_url: null,
            website: '',
            email: user.email || '',
            first_name: authProfile?.firstName || '',
            last_name: authProfile?.lastName || '',
            role: authProfile?.role || 'dispatcher',
            organization_id: authProfile?.organizationId
          }])
          .select()
          .single()

        console.log('New profile creation:', { data: newProfile, error: insertError })

        if (insertError) {
          console.error('Profile creation error:', insertError)
          throw new Error(`Failed to create profile: ${insertError.message}`)
        }

        if (newProfile) {
          setProfileData({
            id: newProfile.id,
            username: newProfile.username,
            full_name: newProfile.full_name,
            avatar_url: newProfile.avatar_url,
            website: newProfile.website,
            email: newProfile.email,
            role: newProfile.role,
            organization_id: newProfile.organization_id,
            first_name: newProfile.first_name,
            last_name: newProfile.last_name
          })
        }
      }
      // Handle single profile case
      else {
        console.log('Single profile found')
        const profile = profiles[0];
        if (profile) {
          setProfileData({
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            website: profile.website,
            email: profile.email,
            role: profile.role,
            organization_id: profile.organization_id,
            first_name: profile.first_name,
            last_name: profile.last_name
          })
        }
      }

    } catch (error) {
      console.error('Detailed error:', error)
      if (error instanceof Error) {
        setError(`Error fetching profile: ${error.message}`)
      } else {
        setError('An unexpected error occurred while loading your profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Use the auth context data
  useEffect(() => {
    if (!authLoading && user) {
      // If we already have profile data from auth context, initialize with it
      if (authProfile) {
        setProfileData({
          id: user.id,
          email: user.email || '',
          username: '',
          full_name: `${authProfile.firstName || ''} ${authProfile.lastName || ''}`.trim(),
          first_name: authProfile.firstName || '',
          last_name: authProfile.lastName || '',
          role: authProfile.role,
          organization_id: authProfile.organizationId,
          avatar_url: null,
          website: ''
        })
      }
      fetchProfile()
      setIsLoading(false)
    }
  }, [authLoading, user, authProfile])

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profileData?.id) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Validate username length
      if (profileData.username && profileData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long')
      }

      // Only update fields that should be editable by the user
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profileData.id,
          username: profileData.username,
          full_name: profileData.full_name,
          website: profileData.website,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        if (error.code === '23505') {
          throw new Error('Username is already taken')
        }
        throw error
      }

      setSuccessMessage('Profile updated successfully')
      // Refresh auth context profile data
      await refreshProfile()
      router.refresh() // Refresh the page to update any displayed profile data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null)
      const file = event.target.files?.[0]
      if (!file || !profileData?.id) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('Image size must be less than 5MB')
        return
      }

      setIsSaving(true)

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const userId = profileData.id
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileData.id)

      if (updateError) throw updateError

      setProfileData(profileData ? { ...profileData, avatar_url: publicUrl } : null)
      // Refresh auth context
      await refreshProfile()
      setSuccessMessage('Avatar updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAvatarRemove() {
    if (!profileData?.avatar_url) return

    try {
      setIsSaving(true)
      setError(null)

      // Extract file name from URL
      const fileName = profileData.avatar_url.split('/').pop()
      if (fileName) {
        // Remove file from storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName])

        if (deleteError) throw deleteError
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profileData.id)

      if (updateError) throw updateError

      setProfileData(profileData ? { ...profileData, avatar_url: null } : null)
      // Refresh auth context
      await refreshProfile()
      setSuccessMessage('Avatar removed successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-2 text-white/60">
            Manage your profile information and settings.
          </p>
        </div>
        <div>
          <SignOutButton variant="destructive" />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-500">{successMessage}</p>
        </div>
      )}

      <div className="bg-[#111111] rounded-2xl p-8 border border-white/5">
        {/* Role Badge Section */}
        <div className="mb-8 pb-8 border-b border-white/5">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-white/5 flex items-center justify-center">
              {profileData?.role === 'admin' ? (
                <ShieldCheckIcon className="w-6 h-6 text-red-400" />
              ) : (
                <TruckIcon className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Account Type</h3>
              <div className="mt-1 flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${profileData?.role === 'admin' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                  {profileData?.role === 'admin' ? 'Administrator' : 'Dispatcher'}
                </span>
                <span className="ml-2 text-sm text-white/60">
                  {profileData?.role === 'admin' ? 'Full access to all features and settings' : 'Access to dispatch operations and limited settings'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Avatar Section */}
        <div className="flex items-center mb-8 pb-8 border-b border-white/5">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
            {profileData?.avatar_url ? (
              <img
                src={profileData.avatar_url}
                alt="Profile"
                className="w-20 h-20 object-cover"
              />
            ) : (
              <UserCircleIcon className="w-12 h-12 text-white/20" />
            )}
          </div>
          <div className="ml-6">
            <h3 className="text-lg font-medium text-white">Profile Picture</h3>
            <p className="text-sm text-white/60 mb-4">
              Upload a new profile picture or remove the current one
            </p>
            <div className="flex space-x-4">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors inline-block">
                  Upload New
                </span>
              </label>
              {profileData?.avatar_url && (
                <button
                  type="button"
                  onClick={handleAvatarRemove}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={updateProfile}>
          <div className="space-y-6">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-white mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    value={profileData?.first_name || ''}
                    onChange={(e) => setProfileData(profileData ? { ...profileData, first_name: e.target.value } : null)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-white mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    value={profileData?.last_name || ''}
                    onChange={(e) => setProfileData(profileData ? { ...profileData, last_name: e.target.value } : null)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={profileData?.username || ''}
                onChange={(e) => setProfileData(profileData ? { ...profileData, username: e.target.value } : null)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="Choose a username"
              />
              <p className="mt-1 text-sm text-white/60">
                This will be your public username visible to other users.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profileData?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="Your email address"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
                Website
              </label>
              <input
                type="text"
                id="website"
                value={profileData?.website || ''}
                onChange={(e) => setProfileData(profileData ? { ...profileData, website: e.target.value } : null)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 