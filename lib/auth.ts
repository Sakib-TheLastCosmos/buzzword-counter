import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser()
  if (error || !authUser) return null

  console.log("Auth User:", authUser)

  // Get user profile from our users table
  const { data: userProfile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

  const safeUserProfile = JSON.parse(JSON.stringify(userProfile))

  console.log(userProfile)
  return safeUserProfile
}


// Client-side version
export async function getCurrentUserClient(): Promise<User | null> {
  const supabase = createBrowserClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single()

  return userProfile ? JSON.parse(JSON.stringify(userProfile)) : null
}

export async function signInWithGoogle() {
  const supabase = createBrowserClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }
}

export async function signOut() {
  const supabase = createBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw error
  }
}

export function isAdmin(user: User | null): boolean {
  if (!user) return false
  return user.role === "admin"
}

export function isApproved(user: User | null): boolean {
  if (!user) return false
  return user.approved
}
