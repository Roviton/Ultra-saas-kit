'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useHasRole } from '@/lib/supabase/auth-context'
import { createSupabaseBrowserClient, UserProfile } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, UserPlus, Building, Users } from 'lucide-react'

export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useAuth()
  const hasAccess = useHasRole('admin')
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    // Redirect non-admin users who somehow reached this page
    if (!isLoading && !hasAccess) {
      router.push('/dashboard/unauthorized')
    }
  }, [isLoading, hasAccess, router])

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!hasAccess) return

      setIsLoadingData(true)
      const supabase = createSupabaseBrowserClient()

      try {
        // Fetch organization data
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
        
        if (orgError) throw orgError
        setOrganizations(orgData || [])

        // Fetch user profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, role, organization_id, first_name, last_name')
        
        if (profilesError) throw profilesError
        
        // Convert to UserProfile format
        const formattedProfiles: UserProfile[] = profilesData.map(profile => ({
          id: profile.id,
          email: profile.email || '',
          role: profile.role as 'admin' | 'dispatcher',
          organizationId: profile.organization_id,
          firstName: profile.first_name,
          lastName: profile.last_name
        }))
        
        setUsers(formattedProfiles)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (hasAccess) {
      fetchAdminData()
    }
  }, [hasAccess])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return null // We'll redirect in the useEffect
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary">
          Admin Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{users.length}</div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Organizations</CardTitle>
            <CardDescription>Active freight companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{organizations.length}</div>
              <Building className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Admins</CardTitle>
            <CardDescription>Users with admin access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {users.filter(user => user.role === 'admin').length}
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Dispatchers</CardTitle>
            <CardDescription>Users with dispatcher role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {users.filter(user => user.role === 'dispatcher').length}
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>List of recently registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Role</th>
                    <th className="py-3 px-4 text-left">Organization ID</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3 px-4">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{user.organizationId || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button 
          onClick={() => router.push('/dashboard')}
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
