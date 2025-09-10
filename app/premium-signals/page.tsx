"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import { Crown, Lock, Eye, EyeOff, BarChart3, Target, Zap, Shield, Star } from "lucide-react"
import { Label } from "@/components/ui/label"
import { PremiumSignalsDashboard } from "@/components/premium-signals-dashboard"

export default function PremiumSignalsPage() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    setTimeout(() => {
      if (password === "adminderiv") {
        setIsAuthenticated(true)
        setError("")
      } else {
        setError("Invalid password. Please try again.")
      }
      setIsLoading(false)
    }, 1000)
  }

  if (!mounted) return null

  // If authenticated, show the premium dashboard
  if (isAuthenticated) {
    return <PremiumSignalsDashboard />
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>

          {/* Premium grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9OVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvYXN2Zz4=')] opacity-30"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            {/* Premium Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
                  <Crown className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-black text-white mb-4">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Premium
                </span>{" "}
                <span className="text-white">Signals</span>
              </h1>
              <p className="text-xl text-gray-300 font-medium">Advanced Trading Intelligence & Market Analysis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side - Features */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-green-500/30">
                      <Target className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">Precision Signals</h3>
                      <p className="text-gray-400">
                        Get highly accurate trading signals with 85-95% success rate for Matches, Even/Odd, and
                        Over/Under strategies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <BarChart3 className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">Real-Time Analysis</h3>
                      <p className="text-gray-400">
                        Live market data analysis with instant signal generation and detailed reasoning for each
                        recommendation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                      <Zap className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">Advanced Algorithms</h3>
                      <p className="text-gray-400">
                        Powered by sophisticated pattern recognition and statistical analysis for maximum profitability.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-500/30">
                      <Shield className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">Risk Management</h3>
                      <p className="text-gray-400">
                        Built-in risk assessment and money management recommendations for sustainable trading.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-black text-green-400 mb-1">95%</div>
                    <div className="text-xs text-gray-400 font-medium">Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-black text-blue-400 mb-1">24/7</div>
                    <div className="text-xs text-gray-400 font-medium">Live Signals</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-black text-purple-400 mb-1">9+</div>
                    <div className="text-xs text-gray-400 font-medium">Markets</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="flex justify-center">
                <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardHeader className="space-y-1 pb-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                        <Lock className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Premium Access</CardTitle>
                    <CardDescription className="text-gray-300 font-medium">
                      Enter your premium password to access advanced signals
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center gap-2 text-white font-medium">
                          <Crown className="h-4 w-4 text-yellow-400" />
                          Premium Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter premium password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 h-12 pr-12"
                            required
                          />
                          <Button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white transition-colors"
                            variant="ghost"
                            size="sm"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>

                      {error && (
                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-yellow-500/20"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin h-5 w-5 mr-2 border-2 border-black border-t-transparent rounded-full"></div>
                            <span>Authenticating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Crown className="h-5 w-5 mr-2" />
                            <span>Access Premium Signals</span>
                          </div>
                        )}
                      </Button>
                    </form>

                    {/* Premium Features List */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
                      <h4 className="text-white font-semibold mb-3 flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-2" />
                        Premium Features
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-2">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></div>
                          High-accuracy Matches signals with specific digits
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></div>
                          Even/Odd predictions with confidence ratings
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></div>
                          Over/Under signals with market analysis
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></div>
                          Real-time charts and live data feeds
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2"></div>
                          Sound notifications for new signals
                        </li>
                      </ul>
                    </div>

                    {/* Back Button */}
                    <Button
                      variant="outline"
                      onClick={() => router.push("/analyzer")}
                      className="w-full border-white/20 text-white hover:bg-white/10 font-medium bg-transparent"
                    >
                      Back to Analyzer
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </ThemeProvider>
  )
}
