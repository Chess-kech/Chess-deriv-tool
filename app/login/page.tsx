"use client"

import { CardFooter } from "@/components/ui/card"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ThemeProvider } from "@/components/theme-provider"
import { useTheme } from "next-themes"
import { Eye, EyeOff, User, Lock, DollarSign, Sparkles, TrendingUp, BarChart3, ArrowRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TermsAndConditions } from "@/components/terms-and-conditions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const { isAuthenticated, login } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Handle hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/analyzer")
    }
  }, [isAuthenticated, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Clear previous errors
    setShowTermsError(false)

    if (!username || !password) {
      setError("Please enter both username and password.")
      return
    }

    if (!agreedToTerms) {
      setShowTermsError(true)
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      const success = login(username, password)
      if (!success) {
        setError("Invalid username or password. Please try again.")
        setIsLoading(false)
      }
      // Redirection is handled by AuthProvider on successful login
    }, 800)
  }

  const handleSignUpDeriv = () => {
    window.open("https://hub.deriv.com/tradershub/signup?lang=en", "_blank")
  }

  if (!mounted) return null

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen relative overflow-hidden">
        {/* Modern Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9OVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L2x0dGVybiA+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCIvPjwvYXN2Zz4=')] opacity-20"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
            <div className="max-w-md">
              {/* Logo and Title */}
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white">
                      <span className="text-red-500">D</span>analysis tool
                    </h1>
                    <p className="text-gray-300 text-sm font-medium">Advanced Trading Platform</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Real-time Analysis</h3>
                    <p className="text-gray-400 text-sm">Advanced pattern recognition and market insights</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Smart Predictions</h3>
                    <p className="text-gray-400 text-sm">AI-powered trading recommendations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Secure Platform</h3>
                    <p className="text-gray-400 text-sm">Enterprise-grade security and reliability</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">99.9%</div>
                  <div className="text-xs text-gray-400 font-medium">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">24/7</div>
                  <div className="text-xs text-gray-400 font-medium">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white">1000+</div>
                  <div className="text-xs text-gray-400 font-medium">Users</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-black text-white">
                  <span className="text-red-500">D</span>analysis tool
                </h1>
                <p className="text-gray-300 text-sm font-medium">Advanced Trading Platform</p>
              </div>

              {/* Login Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-2xl font-bold text-white text-center">Welcome Back</CardTitle>
                  <p className="text-center text-gray-300 font-medium">Access your Deriv Analysis Tool</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2 text-white font-medium">
                        <User className="h-4 w-4" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2 text-white font-medium">
                        <Lock className="h-4 w-4" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-12 pr-12"
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

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => {
                          setAgreedToTerms(checked as boolean)
                          if (checked) setShowTermsError(false)
                        }}
                        className={`border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 ${
                          showTermsError ? "border-red-500" : ""
                        }`}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor="terms"
                          className={`text-sm font-medium leading-none text-white ${
                            showTermsError ? "text-red-400" : ""
                          }`}
                        >
                          I agree to the terms and conditions
                        </Label>
                        <p className="text-xs text-gray-400">
                          By signing in, you agree to our{" "}
                          <button
                            type="button"
                            className="text-purple-400 hover:text-purple-300 underline"
                            onClick={() => setTermsOpen(true)}
                          >
                            Terms of Service
                          </button>
                        </p>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {showTermsError && !error && (
                      <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                        <AlertDescription>You must agree to the terms and conditions</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg transition-all duration-300 transform hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span>Sign In</span>
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-4 pt-6">
                  {/* Pricing Section */}
                  <div className="w-full text-center space-y-3">
                    <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                      <DollarSign className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-2xl font-black text-green-400">85</span>
                    </div>
                  </div>

                  {/* Contact Button */}
                  <Button
                    variant="outline"
                    onClick={() => setContactDialogOpen(true)}
                    className="w-full border-white/20 text-white hover:bg-white/10 font-medium"
                  >
                    Need Login Credentials?
                  </Button>

                  {/* Sign up Deriv Button */}
                  <Button
                    variant="outline"
                    onClick={handleSignUpDeriv}
                    className="w-full border-white/20 text-white hover:bg-white/10 font-medium bg-transparent"
                  >
                    Sign up Deriv
                  </Button>

                  {/* Theme Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Dialog */}
      <TermsAndConditions open={termsOpen} onOpenChange={setTermsOpen} />

      {/* Contact Admin Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Get Login Credentials
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Contact the administrator for platform access
            </DialogDescription>
          </DialogHeader>

          {/* Price Display */}
          <div className="flex justify-center my-4">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg">
              <DollarSign className="h-6 w-6 text-white mr-2" />
              <span className="text-white font-black text-2xl">85</span>
            </div>
          </div>

          <div className="space-y-4"></div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => setContactDialogOpen(false)}>
              Cancel
            </Button>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => {
                  const phoneNumber = "254787570246"
                  const message =
                    "Hi! I want to get access to the Danalysis tool platform. Please provide login credentials."
                  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                  window.open(whatsappUrl, "_blank")
                }}
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </Button>

              <Button
                onClick={() => window.open("https://t.me/+254787570246", "_blank")}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
