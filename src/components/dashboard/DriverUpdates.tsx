"use client"

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface DriverUpdate {
  id: string
  driver_id: string
  update_text: string
  location: any
  created_at: string
}

interface Summary {
  id: string
  summary_text: string
  time_period_end: string
}

export default function DriverUpdates() {
  const supabase = createClientComponentClient()
  const [updates, setUpdates] = useState<DriverUpdate[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Fetch initial data
  const fetchInitial = async () => {
    try {
      const res = await fetch('/api/driver-updates?page=1&pageSize=50')
      const json = await res.json()
      setUpdates(json.data || [])

      const sumRes = await fetch('/api/update-summaries?limit=1')
      const sumJson = await sumRes.json()
      if (sumJson.data && sumJson.data.length > 0) {
        setSummary(sumJson.data[0])
      }
    } finally {
      setLoading(false)
    }
  }

  // Realtime subscription
  const subscribeRealtime = () => {
    const ch = supabase
      .channel('public:driver_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'driver_updates' },
        payload => {
          setUpdates(prev => [payload.new as DriverUpdate, ...prev])
        }
      )
      .subscribe()
    setChannel(ch)
  }

  useEffect(() => {
    fetchInitial()
    subscribeRealtime()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerateSummary = async () => {
    await fetch('/api/generate-summary', { method: 'POST' })
    // Optionally refetch summaries after trigger
    const res = await fetch('/api/update-summaries?limit=1')
    const json = await res.json()
    if (json.data && json.data.length > 0) {
      setSummary(json.data[0])
    }
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-xl p-6 w-full">
      <h2 className="text-xl font-semibold text-white mb-4">Driver Updates</h2>
      {summary && (
        <div className="mb-6 p-4 bg-[#222222] rounded-lg text-white/90">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Latest Summary</h3>
            <button
              onClick={handleGenerateSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              Generate New Summary
            </button>
          </div>
          <p className="text-white/80 text-sm">{summary.summary_text}</p>
          <p className="text-white/40 text-xs mt-2">
            Period ending {new Date(summary.time_period_end).toLocaleString()}
          </p>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-white/60">Loading...</p>
        ) : updates.length === 0 ? (
          <p className="text-white/60">No updates yet.</p>
        ) : (
          updates.map(u => (
            <div key={u.id} className="p-3 bg-[#222222] rounded text-white/80 text-sm">
              <p>{u.update_text}</p>
              <p className="text-white/40 text-xs mt-1">
                {new Date(u.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
