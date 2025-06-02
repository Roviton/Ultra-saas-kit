// Define the WebhookEvent type based on Clerk's event structure
type WebhookEvent = {
  data: Record<string, any>;
  object: string;
  type: string;
};
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  // Get the headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no Svix headers, return 400
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Error: Missing Svix headers');
    return new NextResponse('Error: Missing Svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Error: Missing CLERK_WEBHOOK_SECRET');
    return new NextResponse('Error: Missing CLERK_WEBHOOK_SECRET', {
      status: 500,
    });
  }

  // Verify the webhook
  let event: WebhookEvent;
  
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = event.type;
  console.log(`Webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created':
        // Handle user creation
        console.log('User created:', event.data);
        // Add your user creation logic here
        break;
      case 'user.updated':
        // Handle user update
        console.log('User updated:', event.data);
        // Add your user update logic here
        break;
      case 'user.deleted':
        // Handle user deletion
        console.log('User deleted:', event.data);
        // Add your user deletion logic here
        break;
      case 'session.created':
        // Handle session creation
        console.log('Session created:', event.data);
        // Add your session creation logic here
        break;
      case 'session.ended':
        // Handle session end
        console.log('Session ended:', event.data);
        // Add your session end logic here
        break;
      case 'organization.created':
        // Handle organization creation
        console.log('Organization created:', event.data);
        // Add your organization creation logic here
        break;
      case 'organization.updated':
        // Handle organization update
        console.log('Organization updated:', event.data);
        // Add your organization update logic here
        break;
      case 'organization.deleted':
        // Handle organization deletion
        console.log('Organization deleted:', event.data);
        // Add your organization deletion logic here
        break;
      case 'email.created':
        // Handle email creation
        console.log('Email created:', event.data);
        // Add your email creation logic here
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new NextResponse('Error handling webhook', {
      status: 500,
    });
  }
}
