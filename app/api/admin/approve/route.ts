import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { type, id, status } = body // type: 'user' | 'session' | 'submission'

    // Get current user and verify admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || userProfile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let result
    let error

    switch (type) {
      case "user":
        ;({ data: result, error } = await supabase.from("users").update({ status }).eq("id", id).select().single())
        break

      case "session":
        ;({ data: result, error } = await supabase.from("sessions").update({ status }).eq("id", id).select().single())
        break

      case "submission":
        ;({ data: result, error } = await supabase
          .from("submissions")
          .update({ status })
          .eq("id", id)
          .select()
          .single())
        break

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
