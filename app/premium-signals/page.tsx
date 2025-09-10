"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, AlertTriangle } from "lucide-react"
import { PremiumSignalsDashboard } from "@/components/premium-signals-dashboard"

export default function PremiumSignalsPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  // Check if user is logged into main app
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    setTimeout(() => {
      if (password === "adminderiv") {
        setIsAuthenticated(true)
        setError("")
      } else {
        setError("Invalid password. Access denied.")
      }
      setIsLoading(false)
    }, 1000)
  }

  if (!isLoggedIn) {
    return null // Will redirect to login
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900/80 border-red-500/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/20">
                <Shield className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Premium Signals Access</CardTitle>
            <p className="text-gray-400 mt-2">Restricted Area - Authorization Required</p>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200">
                <strong>Security Notice:</strong> This area contains premium trading signals. Only authorized personnel
                with the correct password may access this content.
              </AlertDescription>
            </Alert>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-white">
                  Access Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter premium access password"
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Access Premium Signals"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-400 hover:text-white">
                ← Back to Main Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <PremiumSignalsDashboard />
}
