import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'

// Schema for creating a driver update
const postSchema = z.object({
  driverId: z.string().uuid(),
  updateText: z.string().min(1),
  location: z.any().optional(),
})

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const pageSize = Number(searchParams.get('pageSize') || 20)
  const driverId = searchParams.get('driverId')

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('driver_updates')
    .select('*')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (driverId) query = query.eq('driver_id', driverId)

  const { data, error } = await query
  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error fetching updates' }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await req.json()
  const parsed = postSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { driverId, updateText, location } = parsed.data

  const { error } = await supabase.from('driver_updates').insert({
    driver_id: driverId,
    update_text: updateText,
    location,
  })

  if (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to insert update' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
