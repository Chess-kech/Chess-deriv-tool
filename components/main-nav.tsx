"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, MessageCircle, Send, Sparkles, Crown } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  // Function to open WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "1234567890" // Replace with actual WhatsApp number
    const message = encodeURIComponent("Hi! I'm interested in your Deriv analysis tool.")

    // Try to open WhatsApp app first, fallback to web
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    // For mobile devices, try the app protocol first
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`

      // Try to open the app
      const iframe = document.createElement("iframe")
      iframe.style.display = "none"
      iframe.src = appUrl
      document.body.appendChild(iframe)

      // Fallback to web version after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe)
        window.open(whatsappUrl, "_blank")
      }, 1000)
    } else {
      // Desktop - open web version
      window.open(whatsappUrl, "_blank")
    }
  }

  // Function to open Telegram
  const openTelegram = () => {
    const telegramUsername = "derivanalysis" // Replace with actual Telegram username
    const message = encodeURIComponent("Hi! I'm interested in your Deriv analysis tool.")

    // Try to open Telegram app first, fallback to web
    const telegramWebUrl = `https://t.me/${telegramUsername}?text=${message}`

    // For mobile devices, try the app protocol first
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const appUrl = `tg://resolve?domain=${telegramUsername}&text=${message}`

      // Try to open the app
      const iframe = document.createElement("iframe")
      iframe.style.display = "none"
      iframe.src = appUrl
      document.body.appendChild(iframe)

      // Fallback to web version after a short delay
      setTimeout(() => {
        document.body.removeChild(iframe)
        window.open(telegramWebUrl, "_blank")
      }, 1000)
    } else {
      // Desktop - open web version
      window.open(telegramWebUrl, "_blank")
    }
  }

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <BarChart3 className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>

      <Link
        href="/analyzer"
        className={cn(
          "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
          pathname === "/analyzer" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <TrendingUp className="h-4 w-4" />
        <span>Analyzer</span>
      </Link>

      <Link
        href="/premium-signals"
        className={cn(
          "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary relative",
          pathname === "/premium-signals" ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Crown className="h-4 w-4 text-yellow-500" />
        <span>Premium Signals</span>
        <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
      </Link>

      {/* WhatsApp Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openWhatsApp}
        className="flex items-center space-x-2 text-sm font-medium transition-all hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400"
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        <span>WhatsApp</span>
      </Button>

      {/* Telegram Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openTelegram}
        className="flex items-center space-x-2 text-sm font-medium transition-all hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
      >
        <Send className="h-4 w-4 text-blue-600" />
        <span>Telegram</span>
      </Button>
    </div>
  )
}
