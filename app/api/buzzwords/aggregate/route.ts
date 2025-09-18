import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const teacherId = searchParams.get("teacherId")
    const timeframe = searchParams.get("timeframe") || "week" // week, month, all

    let query = supabase
      .from("submissions")
      .select(`
        *,
        session:sessions(*),
        user:users(*)
      `)
      .eq("status", "approved")

    if (sessionId) {
      query = query.eq("session_id", sessionId)
    }

    if (teacherId) {
      query = query.eq("sessions.teacher_id", teacherId)
    }

    // Apply timeframe filter
    if (timeframe !== "all") {
      const days = timeframe === "week" ? 7 : 30
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      query = query.gte("created_at", cutoffDate.toISOString())
    }

    const { data: submissions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Aggregate buzzword data
    const buzzwordCounts: Record<string, number> = {}
    const timelineData: Array<{ timestamp: string; buzzword: string; count: number }> = []

    submissions?.forEach((submission) => {
      const data = submission.buzzword_data as Record<string, number>
      Object.entries(data).forEach(([buzzword, count]) => {
        buzzwordCounts[buzzword] = (buzzwordCounts[buzzword] || 0) + count
        timelineData.push({
          timestamp: submission.created_at,
          buzzword,
          count,
        })
      })
    })

    // Sort by count descending
    const sortedBuzzwords = Object.entries(buzzwordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return NextResponse.json({
      buzzwords: sortedBuzzwords.map(([word, count]) => ({ word, count })),
      timeline: timelineData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      totalSubmissions: submissions?.length || 0,
    })
  } catch (error) {
    console.error("Aggregation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
