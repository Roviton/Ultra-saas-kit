import { NextResponse } from 'next/server'

/**
 * This API route has been modified to use mock data instead of Supabase authentication.
 * It will be updated when Clerk authentication is implemented.
 */
export async function GET(req: Request) {
  try {
    // Return mock credits data
    // This will be replaced with actual user credits fetching when authentication is implemented
    return NextResponse.json({ credits: 100 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error fetching credits' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()

    // Mock credits handling
    // This will be replaced with actual user credits handling when authentication is implemented
    const currentCredits = 100
    const newAmount = currentCredits + amount

    // Return mock updated credits
    return NextResponse.json({ credits: newAmount })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Error updating credits' },
      { status: 500 }
    )
  }
} 