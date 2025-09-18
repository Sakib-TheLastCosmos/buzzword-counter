import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { sessionId, buzzwordData, duration } = body

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify session exists and is approved
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("status", "approved")
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found or not approved" }, { status: 404 })
    }

    // Create submission

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        buzzword_data: buzzwordData,
        duration_minutes: duration,
        status: user.role === "admin" ? "approved" : "pending", // Requires admin approval
      })
      .select()
      .single()

    if (submissionError) {
      return NextResponse.json({ error: submissionError.message }, { status: 500 })
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const sessionId = searchParams.get("sessionId")

    let query = supabase
      .from("submissions")
      .select(`
        *,
        session:sessions(
          title,
          teacher:teachers(name)
        ),
        user:users(name, email)
      `)
      .order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (sessionId) {
      query = query.eq("session_id", sessionId)
    }

    const { data: submissions, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Get submissions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
