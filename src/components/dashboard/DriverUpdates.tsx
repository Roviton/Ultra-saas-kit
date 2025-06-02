"use client"

import { useEffect, useState } from 'react'

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

// Mock data for driver updates
const mockDriverUpdates: DriverUpdate[] = [
  {
    id: '1',
    driver_id: 'driver-001',
    update_text: 'Delivered package to 123 Main St. Customer signature received.',
    location: { lat: 37.7749, lng: -122.4194 },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
  },
  {
    id: '2',
    driver_id: 'driver-002',
    update_text: 'Stuck in traffic on Highway 101. ETA delayed by 20 minutes.',
    location: { lat: 37.7833, lng: -122.4167 },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
  },
  {
    id: '3',
    driver_id: 'driver-003',
    update_text: 'Vehicle maintenance required. Stopping at service center.',
    location: { lat: 37.7694, lng: -122.4862 },
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
  },
  {
    id: '4',
    driver_id: 'driver-001',
    update_text: 'Picking up new shipment from warehouse.',
    location: { lat: 37.7694, lng: -122.4862 },
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
  },
  {
    id: '5',
    driver_id: 'driver-004',
    update_text: 'Customer refused delivery. Returning package to depot.',
    location: { lat: 37.7694, lng: -122.4862 },
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
  }
];

// Mock summary data
const mockSummary: Summary = {
  id: '1',
  summary_text: 'Today we had 24 successful deliveries, 3 delayed shipments, and 1 return. Average delivery time was 42 minutes. Driver efficiency is up 5% from yesterday.',
  time_period_end: new Date().toISOString()
};

export default function DriverUpdates() {
  const [updates, setUpdates] = useState<DriverUpdate[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  // Simulate fetching data
  const fetchInitial = async () => {
    // Simulate API delay
    setTimeout(() => {
      setUpdates(mockDriverUpdates);
      setSummary(mockSummary);
      setLoading(false);
    }, 800);
  }

  useEffect(() => {
    fetchInitial();
    // No cleanup needed since we're not using real subscriptions
  }, [])

  const handleGenerateSummary = async () => {
    // Simulate API call with loading state
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Create a new mock summary with current timestamp
      const newSummary: Summary = {
        id: Date.now().toString(),
        summary_text: 'Updated summary: Today we had 28 successful deliveries, 2 delayed shipments, and 0 returns. Average delivery time improved to 38 minutes. Driver efficiency is up 8% from yesterday.',
        time_period_end: new Date().toISOString()
      };
      
      setSummary(newSummary);
      setLoading(false);
    }, 1000);
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
