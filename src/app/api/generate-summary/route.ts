import { NextResponse } from 'next/server'

/**
 * This API route has been modified to use mock data instead of Supabase authentication.
 * It will be updated when Clerk authentication is implemented.
 */

export async function POST(req: Request) {
  // Mock user authentication
  // This will be replaced with actual Clerk authentication when implemented
  const mockUser = {
    id: 'mock-user-id',
    email: 'user@example.com'
  }

  // Mock summary generation response
  const mockData = {
    success: true,
    message: 'Summary generation triggered successfully',
    timestamp: new Date().toISOString()
  }

  // Simulate a delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 500))

  return NextResponse.json({ data: mockData })
}
