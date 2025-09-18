import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/auth"
import { AuthGuard } from "@/components/auth/auth-guard"
import { LiveTracker } from "@/components/sessions/live-tracker"
import { notFound, redirect } from "next/navigation"

interface LiveSessionPageProps {
  params: Promise<{ id: string }>
}

export default async function LiveSessionPage({ params }: LiveSessionPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getCurrentUser()

  // Get session details with buzzwords
  const { data: session } = await supabase
    .from("sessions")
    .select(`
      *,
      teacher:teachers(*)`)
    .eq("id", id)
    .single()

    const { data: buzzwords } = await supabase
    .from("buzzwords")
    .select("*")
    .eq("teacher_id", session?.teacher_id)   // or some other linking column

      session!.buzzwords = buzzwords;  // attach buzzwords to session object
  

  if (!session) {
    notFound()
  }

  if (session.status !== "approved") {
    redirect(`/sessions/${id}`)
  }

  return (
    <AuthGuard requireApproval>
      <div className="min-h-screen bg-background">
        <LiveTracker session={session} user={user!} />
      </div>
    </AuthGuard>
  )
}
