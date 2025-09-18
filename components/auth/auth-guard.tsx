import type React from "react"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
  requireApproval?: boolean
  requireAdmin?: boolean
}

export async function AuthGuard({ children, requireApproval = false, requireAdmin = false }: AuthGuardProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (requireAdmin && user.role !== "admin") {
    redirect("/")
  }

  if (requireApproval && !user.approved && user.role !== "admin") {
    redirect("/profile?message=approval-required")
  }

  return <>{children}</>
}
