// lib/session-aggregates.ts

export interface AggregatedCounts {
  countsSum: Record<string, number>
  countsAvg: Record<string, number>
  countsStd: Record<string, number>
  sampleSize: number
}

export interface TimeSeriesEntry {
  timestamp: string
  counts: Record<string, number>
}

export interface SessionAggregates {
  session_id: string
  counts_sum: Record<string, number>
  counts_avg: Record<string, number>
  counts_stddev: Record<string, number>
  sample_size: number
  time_series: TimeSeriesEntry[]
  last_updated_at: string
}

/**
 * Aggregates count data from multiple submissions
 * Calculates sum, average, and standard deviation for each count key
 */
export function aggregateCounts(submissions: any[]): AggregatedCounts {
  const countsSum: Record<string, number> = {}
  const countsAvg: Record<string, number> = {}
  const countsStd: Record<string, number> = {}
  const sampleSize = submissions.length

  if (sampleSize === 0) {
    return { countsSum, countsAvg, countsStd, sampleSize }
  }

  // Collect all keys from all submissions
  const allKeys = new Set<string>()
  submissions.forEach((submission) => {
    if (submission.counts && typeof submission.counts === 'object') {
      Object.keys(submission.counts).forEach((key) => allKeys.add(key))
    }
  })

  // Calculate sum, average, and standard deviation for each key
  allKeys.forEach((key) => {
    const values = submissions.map((submission) => submission.counts?.[key] || 0)
    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / sampleSize
    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / sampleSize
    const stddev = Math.sqrt(variance)

    countsSum[key] = sum
    countsAvg[key] = avg
    countsStd[key] = stddev
  })

  return { countsSum, countsAvg, countsStd, sampleSize }
}

/**
 * Aggregates timeline data from multiple submissions
 * Combines counts by timestamp across all submissions
 */
export function aggregateTimeSeries(submissions: any[]): TimeSeriesEntry[] {
  const timeSeriesMap: Record<string, Record<string, number>> = {}

  submissions.forEach((submission) => {
    if (!Array.isArray(submission.timeline)) return

    submission.timeline.forEach((entry: any) => {
      if (!entry.timestamp) return

      const timestamp = entry.timestamp

      if (!timeSeriesMap[timestamp]) {
        timeSeriesMap[timestamp] = {}
      }

      if (entry.counts && typeof entry.counts === 'object') {
        Object.entries(entry.counts).forEach(([key, value]) => {
          timeSeriesMap[timestamp][key] = (timeSeriesMap[timestamp][key] || 0) + (value as number)
        })
      }
    })
  })

  return Object.entries(timeSeriesMap)
    .map(([timestamp, counts]) => ({ timestamp, counts }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

/**
 * Main aggregation function that generates complete session aggregates
 * Fetches approved submissions and computes all aggregate statistics
 */
export async function generateSessionAggregates(sessionId: string, supabase: any): Promise<SessionAggregates | null> {
  try {
    // Get approved submissions for this session
    const { data: submissions, error: subError } = await supabase
      .from("submissions")
      .select("counts, timeline")
      .eq("session_id", sessionId)
      .eq("status", "approved")

    if (subError) throw subError

    console.log(sessionId, "Query")

    const { countsSum, countsAvg, countsStd, sampleSize } = aggregateCounts(submissions || [])
    const time_series = aggregateTimeSeries(submissions || [])

    return {
      session_id: sessionId,
      counts_sum: countsSum,
      counts_avg: countsAvg,
      counts_stddev: countsStd,
      sample_size: sampleSize,
      time_series,
      last_updated_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error generating session aggregates:", error)
    return null
  }
}

/**
 * Saves session aggregates to the database
 * Uses upsert to handle both insert and update cases
 */
export async function saveSessionAggregates(aggregates: SessionAggregates, supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("session_aggregates")
      .upsert(aggregates)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error saving session aggregates:", error)
    return false
  }
}

/**
 * Convenience function that generates and saves session aggregates in one call
 */
export async function processSessionAggregates(sessionId: string, supabase: any): Promise<boolean> {
  const aggregates = await generateSessionAggregates(sessionId, supabase)
  console.log(sessionId, aggregates)
  if (!aggregates) {
    return false
  }

  return await saveSessionAggregates(aggregates, supabase)
}