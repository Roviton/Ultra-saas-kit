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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { priceId } = body

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Mock user authentication
    // This will be replaced with actual Clerk authentication when implemented
    const mockUser = {
      id: 'mock-user-id',
      email: 'user@example.com'
    }

    const userId = mockUser.id
    const customerEmail = mockUser.email

    // Mock customer data
    const mockCustomer = {
      id: 'cus_mock123',
      stripe_customer_id: 'cus_stripe123'
    }

    // Use mock customer ID
    const customerId = mockCustomer.stripe_customer_id

    // Skip actual Stripe API calls if Stripe is not configured
    if (!stripe) {
      console.log('Stripe is not configured. Returning mock checkout URL.')
      return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true&mock=true`
      })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Error creating checkout session:', err)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
} 