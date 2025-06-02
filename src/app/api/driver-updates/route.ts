import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * This API route has been modified to use mock data instead of Supabase authentication.
 * It will be updated when Clerk authentication is implemented.
 */

// Schema for creating a driver update
const postSchema = z.object({
  driverId: z.string(),
  updateText: z.string().min(1),
  location: z.any().optional(),
})

// Mock data for driver updates
const mockDriverUpdates = [
  {
    id: '1',
    driver_id: 'driver-123',
    update_text: 'Delivered package to customer',
    location: { lat: 37.7749, lng: -122.4194 },
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: '2',
    driver_id: 'driver-123',
    update_text: 'Stuck in traffic on highway 101',
    location: { lat: 37.7833, lng: -122.4167 },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: '3',
    driver_id: 'driver-456',
    update_text: 'Starting delivery route',
    location: { lat: 37.7694, lng: -122.4862 },
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 20)
  const driverId = searchParams.get('driverId')

  // Filter mock data based on query parameters
  let data = [...mockDriverUpdates]
  
  if (driverId) {
    data = data.filter(update => update.driver_id === driverId)
  }
  
  // Sort by created_at descending
  data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  // Apply pagination
  const start = (page - 1) * pageSize
  const end = page * pageSize
  data = data.slice(start, end)

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = postSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Mock user authentication
  // This will be replaced with actual Clerk authentication when implemented
  const mockUser = {
    id: 'mock-user-id',
    email: 'user@example.com'
  }

  const { driverId, updateText, location } = parsed.data

  // Mock insert operation
  // This will be replaced with actual database operations when authentication is implemented
  const newUpdate = {
    id: Date.now().toString(),
    driver_id: driverId,
    update_text: updateText,
    location,
    created_at: new Date().toISOString()
  }
  
  // Add to mock data (for this session only)
  mockDriverUpdates.unshift(newUpdate)

  return NextResponse.json({ success: true, data: newUpdate })
}
