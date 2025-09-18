export interface User {
  id: string
  name?: string
  email?: string
  photo_url?: string
  role: "user" | "admin"
  approved: boolean
  created_at: string
}

export interface Teacher {
  id: string
  name: string
  bio?: string
  avatar_url?: string
}

export interface Buzzword {
  id: string
  teacher_id: string
  label: string
}

export interface Session {
  id: string
  teacher_id: string
  title: string
  scheduled_at?: string
  created_by?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  teacher?: Teacher
  buzzwords?: Buzzword[]
}

export interface Submission {
  id: string
  session_id: string
  created_by: string
  counts: Record<string, number>
  timeline: Array<{ timestamp: number; buzzword: string }>
  status: "pending" | "approved" | "rejected"
  created_at: string
  approved_at?: string
  approved_by?: string
  session?: Session
}

export interface SessionAggregate {
  session_id: string
  counts_avg?: Record<string, number>
  counts_sum?: Record<string, number>
  counts_stddev?: Record<string, number>
  sample_size?: number
  time_series?: Record<string, Array<{ time: number; count: number }>>
  last_updated_at: string
}
