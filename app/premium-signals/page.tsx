"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Lock, TrendingUp, Target, Zap, Shield, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { PremiumSignalsDashboard } from "@/components/premium-signals-dashboard"
import { useAuth } from "@/components/auth-provider"

export default function PremiumSignalsPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
  const { isAuthenticated: isLoggedIn } = useAuth()

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in to main app
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  const handleLogin = () => {
    if (password === "adminderiv") {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Invalid password")
      setPassword("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  if (!mounted) return null

  const isDarkTheme = theme === "dark"

  if (isAuthenticated) {
    return <PremiumSignalsDashboard />
  }

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4",
        isDarkTheme
          ? "bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900"
          : "bg-gradient-to-br from-pink-50 via-purple-100 to-indigo-50",
      )}
    >
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className={cn(
            "mb-6 flex items-center gap-2",
            isDarkTheme ? "text-purple-300 hover:text-purple-100" : "text-purple-700 hover:text-purple-900",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card
          className={cn(
            "border-2 shadow-2xl",
            isDarkTheme
              ? "bg-gray-900/80 border-purple-500/30 shadow-purple-500/20"
              : "bg-white/90 border-purple-300/50 shadow-purple-500/20",
          )}
        >
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className={cn("p-4 rounded-full", isDarkTheme ? "bg-purple-900/50" : "bg-purple-100")}>
                <Crown className="h-12 w-12 text-yellow-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Premium Signals Access
            </CardTitle>
            <p className={cn("text-sm", isDarkTheme ? "text-gray-400" : "text-gray-600")}>
              Enter your premium access code to continue
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter premium access code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={cn(
                    "pl-10 h-12 text-center font-mono tracking-wider",
                    isDarkTheme
                      ? "bg-gray-800 border-purple-500/30 focus:border-purple-500"
                      : "bg-white border-purple-300 focus:border-purple-500",
                  )}
                />
              </div>

              {error && <div className="text-red-500 text-sm text-center font-medium">{error}</div>}

              <Button
                onClick={handleLogin}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
              >
                Access Premium Signals
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Premium Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Advanced Market Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">High-Accuracy Predictions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Real-Time Signal Alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <span className="text-sm">Professional Trading Tools</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
