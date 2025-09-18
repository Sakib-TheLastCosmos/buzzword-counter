import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const sessionId = params.id

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        *,
        teacher:teachers(*)
      `)
      .eq("id", sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Get live submissions for this session
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select(`
        *,
        user:users(name, email)
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })

    if (submissionsError) {
      return NextResponse.json({ error: submissionsError.message }, { status: 500 })
    }

    // Aggregate real-time data
    const liveStats = {
      totalParticipants: new Set(submissions?.map((s) => s.user_id)).size || 0,
      totalSubmissions: submissions?.length || 0,
      approvedSubmissions: submissions?.filter((s) => s.status === "approved").length || 0,
      pendingSubmissions: submissions?.filter((s) => s.status === "pending").length || 0,
    }

    // Get buzzword frequency from approved submissions
    const buzzwordFrequency: Record<string, number> = {}
    submissions
      ?.filter((s) => s.status === "approved")
      .forEach((submission) => {
        const data = submission.buzzword_data as Record<string, number>
        Object.entries(data).forEach(([buzzword, count]) => {
          buzzwordFrequency[buzzword] = (buzzwordFrequency[buzzword] || 0) + count
        })
      })

    return NextResponse.json({
      session,
      liveStats,
      buzzwordFrequency,
      recentSubmissions: submissions?.slice(0, 5) || [],
    })
  } catch (error) {
    console.error("Live data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
