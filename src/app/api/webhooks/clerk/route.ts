import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';

// Define types for webhook events
type WebhookEvent = {
  data: Record<string, unknown>;
  object: string;
  type: string;
};

// Define headers for svix verification
type SvixHeaders = {
  'svix-id': string;
  'svix-timestamp': string;
  'svix-signature': string;
};

/**
 * Process Clerk webhook events based on type
 * This function handles different event types and logs them
 * In a production app, you would add business logic here
 */
async function processEvent(eventType: string, eventData: WebhookEvent) {
  console.log(`Processing webhook event: ${eventType}`);
  
  switch (eventType) {
    case 'user.created':
      console.log('User created:', eventData.data);
      // Add user to database or trigger onboarding workflow
      break;
      
    case 'user.updated':
      console.log('User updated:', eventData.data);
      // Update user in database
      break;
      
    case 'user.deleted':
      console.log('User deleted:', eventData.data);
      // Remove user data or flag as inactive
      break;
      
    // Session events
    case 'session.created':
      console.log('Session created:', eventData.data);
      // Track user activity
      break;
      
    case 'session.revoked':
      console.log('Session revoked:', eventData.data);
      // Handle security events
      break;
      
    // Organization events
    case 'organization.created':
      console.log('Organization created:', eventData.data);
      // Initialize organization resources
      break;
      
    case 'organization.updated':
      console.log('Organization updated:', eventData.data);
      // Update organization data
      break;
      
    case 'organization.deleted':
      console.log('Organization deleted:', eventData.data);
      // Clean up organization resources
      break;
      
    case 'email.created':
      console.log('Email created:', eventData.data);
      // Track email communications
      break;
      
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

/**
 * Clerk webhook handler
 * Receives webhook events from Clerk and processes them
 * Verifies webhook signatures for security
 */
export async function POST(req: Request) {
  console.log('Clerk webhook endpoint hit');
  
  try {
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    // If webhook secret is not set, log a warning and proceed without verification in development
    if (!webhookSecret) {
      console.warn('CLERK_WEBHOOK_SECRET is not set. Webhook verification is disabled.');
      const payload = await req.json();
      console.log('Webhook payload received (UNVERIFIED):', JSON.stringify(payload));
      const eventType = payload.type;
      await processEvent(eventType, payload as WebhookEvent);
      return NextResponse.json({ success: true });
    }
    
    // Get the request headers directly from the request object
    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');
    
    // If there are no Svix headers, the request is not from Clerk
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Error: Missing Svix headers');
      return new NextResponse('Error: Missing Svix headers', {
        status: 400
      });
    }
    
    // Get the body as text for verification
    const payloadString = await req.text();
    
    // Create a new Svix instance with the webhook secret
    const wh = new Webhook(webhookSecret);
    
    // Prepare headers for verification
    const svixHeaders: SvixHeaders = {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    };
    
    // Verify the webhook
    let evt: WebhookEvent;
    try {
      evt = wh.verify(payloadString, svixHeaders) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error verifying webhook', {
        status: 400
      });
    }
    
    // Log the verified webhook event
    console.log('Webhook verified. Event type:', evt.type);
    
    // Extract the event type
    const eventType = evt.type;
    
    if (!eventType) {
      console.error('Error: Missing event type');
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 });
    }
    
    // Process the webhook event
    await processEvent(eventType, evt);
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
