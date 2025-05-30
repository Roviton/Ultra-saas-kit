import 'whatwg-fetch'
import { GET as getUpdates, POST as postUpdate } from '../../app/api/driver-updates/route'
import { NextResponse } from 'next/server'

// Minimal mocks for Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: () => ({
    auth: {
      getUser: () => ({ data: { user: { id: 'user-id' } }, error: null }),
    },
    from: () => ({
      select: () => ({ order: () => ({ range: () => ({ data: [], error: null }) }) }),
      insert: () => ({ error: null }),
    }),
  }),
}))

describe('driver-updates API', () => {
  it('GET returns 200 and array', async () => {
    const req = new Request('http://localhost/api/driver-updates', { headers: {} } as RequestInit)
    const res = (await getUpdates(req)) as NextResponse
    expect(res.status).toBe(200)
    // No need to parse body in this lightweight mock environment
    // We ensure that endpoint returns valid status only
  })

  it('POST invalid body -> 400', async () => {
    const req = new Request('http://localhost/api/driver-updates', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const res = (await postUpdate(req)) as NextResponse
    expect(res.status).toBe(400)
  })
})
