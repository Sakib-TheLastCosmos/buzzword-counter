"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Teacher, Buzzword } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react"

interface TeacherWithBuzzwords extends Teacher {
  buzzwords: Buzzword[]
}

export function TeacherManagement() {
  const [teachers, setTeachers] = useState<TeacherWithBuzzwords[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<TeacherWithBuzzwords | null>(null)

  const fetchTeachers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("teachers")
      .select(`
        *,
        buzzwords(*)
      `)
      .order("name")

    setTeachers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const handleCreateTeacher = async (formData: FormData) => {
    const supabase = createClient()
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const avatar_url = formData.get("avatar_url") as string

    try {
      const { error } = await supabase.from("teachers").insert({
        name: name.trim(),
        bio: bio.trim() || null,
        avatar_url: avatar_url.trim() || null,
      })

      if (error) throw error

      setShowCreateDialog(false)
      fetchTeachers()
    } catch (error) {
      console.error("Error creating teacher:", error)
      alert("Failed to create teacher")
    }
  }

  const handleUpdateTeacher = async (formData: FormData) => {
    if (!editingTeacher) return

    const supabase = createClient()
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const avatar_url = formData.get("avatar_url") as string

    try {
      const { error } = await supabase
        .from("teachers")
        .update({
          name: name.trim(),
          bio: bio.trim() || null,
          avatar_url: avatar_url.trim() || null,
        })
        .eq("id", editingTeacher.id)

      if (error) throw error

      setEditingTeacher(null)
      fetchTeachers()
    } catch (error) {
      console.error("Error updating teacher:", error)
      alert("Failed to update teacher")
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this teacher? This will also delete all associated buzzwords and sessions.",
      )
    ) {
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.from("teachers").delete().eq("id", teacherId)

      if (error) throw error

      fetchTeachers()
    } catch (error) {
      console.error("Error deleting teacher:", error)
      alert("Failed to delete teacher")
    }
  }

  const handleAddBuzzword = async (teacherId: string, label: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("buzzwords").insert({
        teacher_id: teacherId,
        label: label.trim(),
      })

      if (error) throw error

      fetchTeachers()
    } catch (error) {
      console.error("Error adding buzzword:", error)
      alert("Failed to add buzzword")
    }
  }

  const handleDeleteBuzzword = async (buzzwordId: string) => {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("buzzwords").delete().eq("id", buzzwordId)

      if (error) throw error

      fetchTeachers()
    } catch (error) {
      console.error("Error deleting buzzword:", error)
      alert("Failed to delete buzzword")
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading teachers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{teachers.length} teachers</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTeachers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Teacher</DialogTitle>
                <DialogDescription>Add a new teacher to the platform</DialogDescription>
              </DialogHeader>
              <form action={handleCreateTeacher} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" name="bio" placeholder="Brief description of the teacher..." />
                </div>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input id="avatar_url" name="avatar_url" type="url" placeholder="https://..." />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Teacher</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teachers.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            onEdit={setEditingTeacher}
            onDelete={handleDeleteTeacher}
            onAddBuzzword={handleAddBuzzword}
            onDeleteBuzzword={handleDeleteBuzzword}
          />
        ))}
      </div>

      {/* Edit Teacher Dialog */}
      <Dialog open={!!editingTeacher} onOpenChange={() => setEditingTeacher(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update teacher information</DialogDescription>
          </DialogHeader>
          {editingTeacher && (
            <form action={handleUpdateTeacher} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input id="edit-name" name="name" defaultValue={editingTeacher.name} required />
              </div>
              <div>
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea id="edit-bio" name="bio" defaultValue={editingTeacher.bio || ""} />
              </div>
              <div>
                <Label htmlFor="edit-avatar_url">Avatar URL</Label>
                <Input
                  id="edit-avatar_url"
                  name="avatar_url"
                  type="url"
                  defaultValue={editingTeacher.avatar_url || ""}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingTeacher(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Teacher</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TeacherCardProps {
  teacher: TeacherWithBuzzwords
  onEdit: (teacher: TeacherWithBuzzwords) => void
  onDelete: (teacherId: string) => void
  onAddBuzzword: (teacherId: string, label: string) => void
  onDeleteBuzzword: (buzzwordId: string) => void
}

function TeacherCard({ teacher, onEdit, onDelete, onAddBuzzword, onDeleteBuzzword }: TeacherCardProps) {
  const [newBuzzword, setNewBuzzword] = useState("")

  const handleAddBuzzword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBuzzword.trim()) {
      onAddBuzzword(teacher.id, newBuzzword.trim())
      setNewBuzzword("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={teacher.avatar_url || ""} alt={teacher.name} />
              <AvatarFallback>{teacher.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{teacher.name}</CardTitle>
              <CardDescription className="line-clamp-2">{teacher.bio || "No bio provided"}</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => onEdit(teacher)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDelete(teacher.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Buzzwords ({teacher.buzzwords.length})</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {teacher.buzzwords.map((buzzword) => (
              <Badge key={buzzword.id} variant="secondary" className="group">
                {buzzword.label}
                <button
                  onClick={() => onDeleteBuzzword(buzzword.id)}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <form onSubmit={handleAddBuzzword} className="flex gap-2">
            <Input
              placeholder="Add buzzword..."
              value={newBuzzword}
              onChange={(e) => setNewBuzzword(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
