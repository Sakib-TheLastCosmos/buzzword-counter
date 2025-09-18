"use client"

import { useState, useEffect } from "react"

interface LiveData {
  session: any
  liveStats: {
    totalParticipants: number
    totalSubmissions: number
    approvedSubmissions: number
    pendingSubmissions: number
  }
  buzzwordFrequency: Record<string, number>
  recentSubmissions: any[]
}

export function useLiveData(sessionId: string, refreshInterval = 5000) {
  const [data, setData] = useState<LiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/live-data`)
        if (!response.ok) {
          throw new Error("Failed to fetch live data")
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, refreshInterval)

    return () => clearInterval(interval)
  }, [sessionId, refreshInterval])

  return { data, loading, error, refetch: () => setLoading(true) }
}
