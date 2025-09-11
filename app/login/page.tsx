"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Lock, User, AlertCircle, MessageCircle, Send, TrendingUp } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const success = await login(username, password)

    if (success) {
      router.push("/")
    } else {
      setError("Invalid username or password")
    }

    setIsLoading(false)
  }

  // Function to open WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "254787570246"
    const message = encodeURIComponent("I would like to purchase deriv analysis tool logins")

    // WhatsApp URL for web and mobile
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    // For mobile devices, try the app protocol first
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Try WhatsApp app protocol
      const appUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`

      // Create a temporary link to try opening the app
      const link = document.createElement("a")
      link.href = appUrl
      link.style.display = "none"
      document.body.appendChild(link)

      // Try to click the link to open the app
      try {
        link.click()
        // If app doesn't open within 2 seconds, fallback to web
        setTimeout(() => {
          window.open(whatsappUrl, "_blank")
        }, 2000)
      } catch (error) {
        // Fallback to web version
        window.open(whatsappUrl, "_blank")
      } finally {
        document.body.removeChild(link)
      }
    } else {
      // Desktop - open web version directly
      window.open(whatsappUrl, "_blank")
    }
  }

  // Function to open Telegram
  const openTelegram = () => {
    const phoneNumber = "254787570246"
    const message = encodeURIComponent("I would like to purchase deriv analysis tool logins")

    // Telegram URL for web
    const telegramWebUrl = `https://t.me/+${phoneNumber}?text=${message}`

    // For mobile devices, try the app protocol first
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Try Telegram app protocol
      const appUrl = `tg://msg?to=+${phoneNumber}&text=${message}`

      // Create a temporary link to try opening the app
      const link = document.createElement("a")
      link.href = appUrl
      link.style.display = "none"
      document.body.appendChild(link)

      // Try to click the link to open the app
      try {
        link.click()
        // If app doesn't open within 2 seconds, fallback to web
        setTimeout(() => {
          window.open(telegramWebUrl, "_blank")
        }, 2000)
      } catch (error) {
        // Fallback to web version
        window.open(telegramWebUrl, "_blank")
      } finally {
        document.body.removeChild(link)
      }
    } else {
      // Desktop - open web version directly
      window.open(telegramWebUrl, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              <span className="text-red-500">D</span>analysis Tool
            </h1>
          </div>
          <p className="text-gray-300">Professional Trading Analysis Platform</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-white/20 bg-white/10 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-white">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Sign in to access your trading dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <Separator className="my-6 bg-white/20" />

            {/* Contact Section */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-300 mb-4">Need login credentials? Contact us:</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* WhatsApp Button */}
                <Button
                  variant="outline"
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-2 h-11 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 transition-all bg-transparent text-green-400"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-medium">GetloginsWhatsApp</span>
                </Button>

                {/* Telegram Button */}
                <Button
                  variant="outline"
                  onClick={openTelegram}
                  className="flex items-center justify-center gap-2 h-11 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all bg-transparent text-blue-400"
                >
                  <Send className="h-4 w-4" />
                  <span className="font-medium">Telegram</span>
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400">Contact us for support, account issues, or trading assistance</p>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
              <div className="text-center">
                <p className="text-green-400 font-semibold text-lg">Premium Access - $85</p>
                <p className="text-xs text-gray-300 mt-1">Get instant login credentials and full platform access</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-400">
          <p>© 2024 Deriv Analysis Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
