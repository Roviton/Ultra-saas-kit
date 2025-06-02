import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

/**
 * This API route has been modified to remove Supabase authentication code.
 * It will be updated when Clerk authentication is implemented.
 */

// Initialize Stripe conditionally to avoid errors if key is not set
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    // If Stripe is not configured, just return success
    if (!stripe || !webhookSecret) {
      console.log('Stripe is not configured. Skipping webhook processing.');
      return NextResponse.json({ received: true });
    }
    
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Mock database operations - log events instead of storing in database
    // This will be replaced with actual Clerk authentication and database operations when implemented
    console.log(`Received Stripe webhook event: ${event.type}`);
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session completed for user: ${session.metadata?.userId}`);
        
        // In a real implementation, we would store the subscription in the database
        if (session.subscription) {
          console.log(`Subscription created: ${session.subscription}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        
        // In a real implementation, we would update the subscription in the database
        if (invoice.subscription) {
          console.log(`Subscription updated: ${invoice.subscription}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id}`);
        console.log(`New status: ${subscription.status}`);
        console.log(`Cancel at period end: ${subscription.cancel_at_period_end}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription deleted: ${subscription.id}`);
        console.log(`Final status: ${subscription.status}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error in Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}