import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d" // 7d, 30d, 90d

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    // Get approved submissions within the timeframe
    const { data: submissions, error } = await supabase
      .from("submissions")
      .select(`
        *,
        session:sessions(
          title,
          teacher:teachers(name)
        )
      `)
      .eq("status", "approved")
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process data for trends
    const dailyData: Record<string, Record<string, number>> = {}
    const buzzwordTotals: Record<string, number> = {}

    submissions?.forEach((submission) => {
      const date = new Date(submission.created_at).toISOString().split("T")[0]
      const data = submission.buzzword_data as Record<string, number>

      if (!dailyData[date]) {
        dailyData[date] = {}
      }

      Object.entries(data).forEach(([buzzword, count]) => {
        dailyData[date][buzzword] = (dailyData[date][buzzword] || 0) + count
        buzzwordTotals[buzzword] = (buzzwordTotals[buzzword] || 0) + count
      })
    })

    // Get top 5 buzzwords by total usage
    const topBuzzwords = Object.entries(buzzwordTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)

    // Format data for charts
    const chartData = Object.entries(dailyData).map(([date, buzzwords]) => {
      const dataPoint: any = { date }
      topBuzzwords.forEach((buzzword) => {
        dataPoint[buzzword] = buzzwords[buzzword] || 0
      })
      return dataPoint
    })

    return NextResponse.json({
      chartData,
      topBuzzwords,
      totalSubmissions: submissions?.length || 0,
      dateRange: {
        start: cutoffDate.toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
      },
    })
  } catch (error) {
    console.error("Trends error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
