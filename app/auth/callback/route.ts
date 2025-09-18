import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Check if user exists in our users table, if not create them
      const { data: existingUser } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (!existingUser) {
        // Create user profile
        await supabase.from("users").insert({
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split("@")[0],
          email: user.email,
          photo_url: user.user_metadata?.avatar_url,
          role: "user",
          approved: false,
        })
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
