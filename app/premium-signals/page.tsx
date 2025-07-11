"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Crown, Lock } from "lucide-react"
import { PremiumSignalsDashboard } from "@/components/premium-signals-dashboard"

export default function PremiumSignalsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const PREMIUM_PASSWORD = "login1"

  useEffect(() => {
    // Check if user is already authenticated
    const savedAuth = localStorage.getItem("premium-signals-auth")
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PREMIUM_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("premium-signals-auth", "authenticated")
      setError("")
    } else {
      setError("Invalid password. Please try again.")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("premium-signals-auth")
    setPassword("")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-gradient-to-r from-yellow-400/20 to-orange-500/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-black" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Premium Signals
              </CardTitle>
              <p className="text-muted-foreground mt-2">Advanced Deriv Digits Analysis Tool</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Access Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter premium access password"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold"
              >
                Access Premium Signals
              </Button>
            </form>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Premium Features:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Live Matches Strategy Signals</li>
                <li>• Even/Odd Pattern Analysis</li>
                <li>• Over/Under Trend Detection</li>
                <li>• Real-time Confidence Scoring</li>
                <li>• Advanced Signal History</li>
                <li>• Audio Notifications</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <PremiumSignalsDashboard onLogout={handleLogout} />
}
