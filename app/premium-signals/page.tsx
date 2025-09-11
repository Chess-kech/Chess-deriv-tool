"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { PremiumSignalsDashboard } from "@/components/premium-signals-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Shield, AlertCircle } from "lucide-react"

export default function PremiumSignalsPage() {
  const [premiumPassword, setPremiumPassword] = useState("")
  const [isPremiumAuthenticated, setIsPremiumAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const handlePremiumLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Check premium password
    if (premiumPassword === "adminderiv") {
      setIsPremiumAuthenticated(true)
      setError("")
    } else {
      setError("Invalid premium password")
    }

    setIsLoading(false)
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (!isPremiumAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-white/20 bg-white/10 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Premium Signals</CardTitle>
            <p className="text-gray-300">Enter premium password to access advanced trading signals</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePremiumLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="premium-password" className="text-white">
                  Premium Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="premium-password"
                    type="password"
                    placeholder="Enter premium password"
                    value={premiumPassword}
                    onChange={(e) => setPremiumPassword(e.target.value)}
                    className="pl-10 h-11 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
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
                className="w-full h-11 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Access Premium Signals"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg">
              <div className="text-center">
                <p className="text-blue-400 font-semibold">Premium Features</p>
                <ul className="text-xs text-gray-300 mt-2 space-y-1">
                  <li>• Advanced trading signals with 85-97% accuracy</li>
                  <li>• Real-time market analysis</li>
                  <li>• Live digit pattern recognition</li>
                  <li>• Sound notifications for new signals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <PremiumSignalsDashboard />
}
