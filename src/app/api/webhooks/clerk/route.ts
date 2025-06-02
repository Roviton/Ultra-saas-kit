import { NextResponse } from 'next/server';

// Define a type for the webhook event data
type WebhookEvent = {
  data: Record<string, any>;
  object: string;
  type: string;
};

export async function POST(req: Request) {
  console.log('Clerk webhook endpoint hit');
  
  try {
    // Get the webhook body
    const payload = await req.json();
    
    // Log the webhook event
    console.log('Webhook payload received:', JSON.stringify(payload));
    
    // Extract the event type
    const eventType = payload.type;
    
    if (!eventType) {
      console.error('Error: Missing event type');
      return NextResponse.json({ error: 'Missing event type' }, { status: 400 });
    }
    
    console.log(`Processing webhook event: ${eventType}`);
    
    // Process the webhook based on the event type
    switch (eventType) {
      case 'user.created':
        console.log('User created:', payload.data);
        // Add your user creation logic here
        break;
        
      case 'user.updated':
        console.log('User updated:', payload.data);
        // Add your user update logic here
        break;
        
      case 'user.deleted':
        console.log('User deleted:', payload.data);
        // Add your user deletion logic here
        break;
        
      case 'session.created':
        console.log('Session created:', payload.data);
        // Add your session creation logic here
        break;
        
      case 'session.ended':
        console.log('Session ended:', payload.data);
        // Add your session end logic here
        break;
        
      case 'organization.created':
        console.log('Organization created:', payload.data);
        // Add your organization creation logic here
        break;
        
      case 'organization.updated':
        console.log('Organization updated:', payload.data);
        // Add your organization update logic here
        break;
        
      case 'organization.deleted':
        console.log('Organization deleted:', payload.data);
        // Add your organization deletion logic here
        break;
        
      case 'email.created':
        console.log('Email created:', payload.data);
        // Add your email creation logic here
        break;
        
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    // Return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
