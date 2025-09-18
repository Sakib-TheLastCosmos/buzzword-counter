import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

export async function Header() {
  const user = await getCurrentUser()
  console.log(user)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="text-balance">Buzzword Counter</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/teachers" className="text-sm font-medium hover:text-primary transition-colors">
            Teachers
          </Link>
          <Link href="/sessions" className="text-sm font-medium hover:text-primary transition-colors">
            Sessions
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
