import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Invoke Edge Function
  const { data, error } = await supabase.functions.invoke('summarise_updates')

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to trigger summary' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
