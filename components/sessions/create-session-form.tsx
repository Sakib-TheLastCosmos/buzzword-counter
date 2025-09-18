"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser, getCurrentUserClient } from "@/lib/auth"
import type { Teacher, Buzzword } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

interface CreateSessionFormProps {
  teacher: Teacher
  buzzwords: Buzzword[]
}

export function CreateSessionForm({ teacher, buzzwords }: CreateSessionFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault()
    if (!title.trim()) {
      setError("Session title is required")
      return
    }


    setIsSubmitting(true)
    setError(null)

    try {

      const supabase = createClient()

      const user = await getCurrentUserClient()
      console.log(user)
                                  console.log("error")


      if (!user) {
        throw new Error("User not authenticated")
      }

      const status = user.role === "admin" ? "approved" : "pending"

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          teacher_id: teacher.id,
          title: title.trim(),
          scheduled_at: scheduledAt || null,
          created_by: user.id,
          status
        })
        .select()
        .single()


      if (error) throw error

      router.push(`/sessions/${data.id}?created=true`)
    } catch (error) {
      console.error("Error creating session:", error)
      setError(error instanceof Error ? error.message : "Failed to create session")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={teacher.avatar_url || ""} alt={teacher.name} />
              <AvatarFallback className="text-xl">{teacher.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Create New Session</CardTitle>
              <CardDescription>Create a new buzzword tracking session for {teacher.name}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>Provide information about the session you want to create</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Machine Learning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled Date & Time (Optional)</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Leave empty if the session date is not yet determined</p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating Session..." : "Create Session"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buzzwords for This Teacher</CardTitle>
          <CardDescription>
            These buzzwords will be available for tracking during sessions with {teacher.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {buzzwords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {buzzwords.map((buzzword) => (
                <Badge key={buzzword.id} variant="secondary">
                  {buzzword.label}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No buzzwords defined for this teacher yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Session Created</p>
              <p className="text-sm text-muted-foreground">Your session will be created with "pending" status</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Admin Review</p>
              <p className="text-sm text-muted-foreground">An administrator will review and approve your session</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Live Tracking</p>
              <p className="text-sm text-muted-foreground">
                Once approved, users can join the session for live buzzword tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
