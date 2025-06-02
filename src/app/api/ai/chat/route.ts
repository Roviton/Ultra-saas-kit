import { NextResponse } from 'next/server'
import OpenAI from 'openai'

/**
 * This API route has been modified to use mock authentication instead of Supabase.
 * It will be updated when Clerk authentication is implemented.
 */

// Make OpenAI initialization conditional
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: Request) {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI is not configured. Please add your API key to the environment variables.' },
        { status: 503 }
      )
    }
    
    const { messages } = await req.json()
    
    // Mock authentication and credits check
    // This will be replaced with actual Clerk authentication when implemented
    const mockUser = {
      id: 'mock-user-id',
      email: 'user@example.com'
    }
    
    // Mock credits - always have enough for now
    const mockCredits = {
      credits: 100
    }

    // Make request to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    // Mock credit deduction
    // This will be replaced with actual credit management when authentication is implemented
    console.log('Mock credit deduction for user:', mockUser.id)
    const updatedCredits = mockCredits.credits - 1

    return NextResponse.json(completion.choices[0]?.message ?? { content: "No response generated" })
  } catch (error) {
    console.error('Error in chat route:', error)
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    )
  }
} 