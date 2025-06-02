import { NextResponse } from 'next/server'

/**
 * This API route has been modified to use mock data instead of Supabase authentication.
 * It will be updated when Clerk authentication is implemented.
 */

// Mock data for update summaries
const mockSummaries = [
  {
    id: '1',
    summary: 'All drivers completed their routes on time. Average delivery time was 35 minutes.',
    time_period_start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    time_period_end: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: '2',
    summary: 'Three drivers reported traffic delays. Customer satisfaction remained at 94%.',
    time_period_start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    time_period_end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
  },
  {
    id: '3',
    summary: 'New route optimization resulted in 15% faster deliveries this week.',
    time_period_start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    time_period_end: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString()
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || 20)

  // Mock user authentication
  // This will be replaced with actual Clerk authentication when implemented
  const mockUser = {
    id: 'mock-user-id',
    email: 'user@example.com'
  }

  // Filter mock data based on query parameters and apply limit
  const data = mockSummaries.slice(0, limit)

  return NextResponse.json({ data })
}
