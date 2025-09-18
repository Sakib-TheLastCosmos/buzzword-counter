// teacher/[id]/create-session/page.tsx
import { createClient } from "@/lib/supabase/server"
import { AuthGuard } from "@/components/auth/auth-guard"
import { CreateSessionForm } from "@/components/sessions/create-session-form"
import { notFound } from "next/navigation"

interface CreateSessionPageProps {
  params: { id: string }
}

export default async function CreateSessionPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = await createClient()

  // Teacher
  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", id)
    .single()

  if (!teacher) notFound()

  // Buzzwords
  const { data: buzzwords } = await supabase
    .from("buzzwords")
    .select("*")
    .eq("teacher_id", id)
    .order("label")

  // ✅ Manually ensure plain objects
  const safeTeacher = {
    id: teacher.id,
    name: teacher.name,
    avatar_url: teacher.avatar_url ?? null,
  }

  const safeBuzzwords = (buzzwords ?? []).map((b) => ({
    id: b.id,
    label: b.label,
    teacher_id: b.teacher_id
  }))

  return (
    <AuthGuard requireApproval>
      <div className="container mx-auto py-8 px-4">
        <CreateSessionForm teacher={safeTeacher} buzzwords={safeBuzzwords} />
      </div>
    </AuthGuard>
  )
}
