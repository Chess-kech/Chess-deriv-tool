"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
    },
    {
      name: "Analyzer",
      href: "/analyzer",
    },
    {
      name: "Premium Signals",
      href: "/premium-signals",
      icon: Crown,
      premium: true,
    },
  ]

  return (
    <div className="relative">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="absolute top-12 left-0 z-50 w-64 bg-background border rounded-md shadow-lg p-4 md:hidden">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.name}
                {item.premium && (
                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-1.5 py-0.5 rounded-full font-semibold">
                    PRO
                  </span>
                )}
              </Link>
            ))}
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </nav>
        </div>
      )}

      {/* Desktop menu */}
      <nav className="hidden md:flex items-center space-x-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.name}
            {item.premium && (
              <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-1.5 py-0.5 rounded-full font-semibold">
                PRO
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}
