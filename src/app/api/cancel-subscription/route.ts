import { NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * This API route has been modified to use mock data instead of Supabase authentication.
 * It will be updated when Clerk authentication is implemented.
 */

// Initialize Stripe conditionally to avoid errors if key is not set
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
}

// Mock subscription data
const mockSubscriptions = [
  {
    id: 'sub_123456',
    subscription_id: 'sub_stripe_123456',
    user_id: 'user_123',
    status: 'active',
    cancel_at_period_end: false,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { subscriptionId } = body

    // Mock authentication and database operations
    // Find subscription in mock data
    const subscription = mockSubscriptions.find(sub => sub.id === subscriptionId)

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Mock Stripe API call if Stripe is configured
    if (stripe) {
      console.log(`Mock: Would cancel Stripe subscription ${subscription.subscription_id}`)
      // In a real implementation, this would call the Stripe API:
      // await stripe.subscriptions.update(subscription.subscription_id, {
      //   cancel_at_period_end: true,
      // })
    }

    // Update mock subscription data
    subscription.cancel_at_period_end = true
    subscription.updated_at = new Date().toISOString()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error canceling subscription:', err)
    return NextResponse.json(
      { error: 'Error canceling subscription' },
      { status: 500 }
    )
  }
} 