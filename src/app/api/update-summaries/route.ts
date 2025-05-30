import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') || 20)

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('update_summaries')
    .select('*')
    .order('time_period_end', { ascending: false })
    .limit(limit)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error fetching summaries' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
