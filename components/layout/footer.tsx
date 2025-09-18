import Link from "next/link"
import { BarChart3 } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Buzzword Counter</span>
            </Link>
            <p className="text-sm text-muted-foreground">Track and analyze buzzwords in presentations and lectures.</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/teachers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Teachers
                </Link>
              </li>
              <li>
                <Link href="/sessions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Sessions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/submissions" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Submissions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Buzzword Counter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
