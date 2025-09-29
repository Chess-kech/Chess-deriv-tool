"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  FileText,
  Users,
  Lock,
  Globe,
  CreditCard,
  Loader2,
  ExternalLink,
  Info,
  Crown,
  Zap,
  TrendingUp,
  BarChart3,
  Target,
} from "lucide-react"
import { AmericanFlag } from "@/components/american-flag"

// Detect if running in TikTok or other restricted environments
const isRestrictedEnvironment = () => {
  if (typeof window === "undefined") return false

  const userAgent = navigator.userAgent.toLowerCase()
  const restrictedApps = [
    "tiktok",
    "bytedance",
    "musically",
    "instagram",
    "facebook",
    "fbav",
    "fban",
    "twitter",
    "snapchat",
  ]

  return restrictedApps.some((app) => userAgent.includes(app))
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [isRestricted, setIsRestricted] = useState(false)

  const { login } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()

  const phoneNumber = "+1 (555) 123-4567"
  const whatsappMessage = "Hi, I'd like to access the Premium Deriv Analysis Tool for $85. Please help me get started."

  useEffect(() => {
    setMounted(true)
    setIsRestricted(isRestrictedEnvironment())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions to continue")
      return
    }

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        login(data.user)
        router.push("/analyzer")
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWhatsAppClick = () => {
    if (isRestricted) {
      setShowContactDialog(true)
      return
    }

    const whatsappUrl = `https://wa.me/15551234567?text=${encodeURIComponent(whatsappMessage)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleTelegramClick = () => {
    if (isRestricted) {
      setShowContactDialog(true)
      return
    }

    const telegramUrl = "https://t.me/DerivAnalysisTool"
    window.open(telegramUrl, "_blank")
  }

  const copyToClipboard = async (text: string, type: "phone" | "message") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "phone") {
        setCopiedPhone(true)
        setTimeout(() => setCopiedPhone(false), 2000)
      } else {
        setCopiedMessage(true)
        setTimeout(() => setCopiedMessage(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4 transition-colors duration-500",
        isDark
          ? "bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900"
          : "bg-gradient-to-br from-pink-50 via-purple-100 to-indigo-50",
      )}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  isDark
                    ? "bg-gradient-to-br from-purple-600 to-pink-600"
                    : "bg-gradient-to-br from-purple-500 to-pink-500",
                )}
              >
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <AmericanFlag className="w-8 h-6" />
          </div>

          <h1
            className={cn(
              "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
              isDark ? "from-purple-400 via-pink-400 to-purple-400" : "from-purple-600 via-pink-600 to-purple-600",
            )}
          >
            Deriv Analysis
          </h1>
          <p className={cn("text-lg", isDark ? "text-gray-300" : "text-gray-600")}>
            Premium Trading Intelligence Platform
          </p>

          {/* Premium Badge */}
          <div className="flex justify-center">
            <Badge
              className={cn(
                "px-4 py-2 text-sm font-semibold",
                "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
                "shadow-lg shadow-yellow-500/25",
              )}
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium Access - $85
            </Badge>
          </div>
        </div>

        {/* Features Preview */}
        <Card
          className={cn(
            "backdrop-blur-xl border transition-all duration-300",
            isDark
              ? "bg-gray-900/60 border-purple-500/20 hover:border-purple-500/40"
              : "bg-white/80 border-purple-200/50 hover:border-purple-300/70",
            "shadow-xl hover:shadow-2xl",
          )}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <BarChart3 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Live Market Analysis</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">AI-Powered Predictions</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">Advanced Trading Signals</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card
          className={cn(
            "backdrop-blur-xl border transition-all duration-300",
            isDark
              ? "bg-gray-900/60 border-purple-500/20 hover:border-purple-500/40"
              : "bg-white/80 border-purple-200/50 hover:border-purple-300/70",
            "shadow-xl hover:shadow-2xl",
          )}
        >
          <CardHeader>
            <CardTitle className="text-center">Access Premium Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "h-12 transition-all duration-300",
                    isDark
                      ? "bg-gray-800/50 border-purple-500/30 focus:border-purple-400"
                      : "bg-white/70 border-purple-300/50 focus:border-purple-500",
                  )}
                  required
                />
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "h-12 transition-all duration-300",
                    isDark
                      ? "bg-gray-800/50 border-purple-500/30 focus:border-purple-400"
                      : "bg-white/70 border-purple-300/50 focus:border-purple-500",
                  )}
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                    I agree to the{" "}
                    <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-purple-600 hover:text-purple-700 underline font-semibold">
                          Terms and Conditions
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Terms and Conditions
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-6 text-sm">
                            {/* Terms content */}
                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-purple-600">1. Acceptance of Terms</h3>
                              <p className="mb-3">
                                By accessing and using the Deriv Analysis Tool ("Service"), you accept and agree to be
                                bound by the terms and provision of this agreement.
                              </p>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-blue-600">2. Service Description</h3>
                              <p className="mb-3">
                                Our Service provides advanced trading analysis tools, market predictions, and trading
                                signals for educational and informational purposes. The Service includes:
                              </p>
                              <ul className="list-disc pl-6 space-y-1">
                                <li>Real-time market data analysis</li>
                                <li>AI-powered trading predictions</li>
                                <li>Advanced chart analysis tools</li>
                                <li>Trading pattern recognition</li>
                                <li>Risk assessment indicators</li>
                              </ul>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-red-600">3. Risk Disclaimer</h3>
                              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                <p className="font-semibold text-red-700 dark:text-red-400 mb-2">
                                  ⚠️ IMPORTANT RISK WARNING
                                </p>
                                <p className="mb-3">
                                  Trading involves substantial risk and may result in the loss of your invested capital.
                                  You should not invest money that you cannot afford to lose. Before deciding to trade,
                                  you should carefully consider your investment objectives, level of experience, and
                                  risk appetite.
                                </p>
                                <ul className="list-disc pl-6 space-y-1">
                                  <li>Past performance is not indicative of future results</li>
                                  <li>Our predictions and signals are not guaranteed to be accurate</li>
                                  <li>You are solely responsible for your trading decisions</li>
                                  <li>We do not provide financial advice</li>
                                </ul>
                              </div>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-green-600">4. Payment Terms</h3>
                              <p className="mb-3">
                                Access to our premium features requires a one-time payment of $85 USD. Payment terms:
                              </p>
                              <ul className="list-disc pl-6 space-y-1">
                                <li>Payment is required before accessing premium features</li>
                                <li>All payments are processed securely</li>
                                <li>Refunds may be available within 7 days of purchase</li>
                                <li>Prices are subject to change without notice</li>
                              </ul>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-purple-600">5. User Responsibilities</h3>
                              <p className="mb-3">As a user of our Service, you agree to:</p>
                              <ul className="list-disc pl-6 space-y-1">
                                <li>Use the Service only for lawful purposes</li>
                                <li>Not share your account credentials with others</li>
                                <li>Not attempt to reverse engineer or copy our algorithms</li>
                                <li>Comply with all applicable laws and regulations</li>
                                <li>Use the information provided for educational purposes only</li>
                              </ul>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-orange-600">6. Privacy Policy</h3>
                              <p className="mb-3">
                                We are committed to protecting your privacy. Our privacy practices include:
                              </p>
                              <ul className="list-disc pl-6 space-y-1">
                                <li>We collect only necessary information to provide our Service</li>
                                <li>Your personal data is encrypted and stored securely</li>
                                <li>We do not sell or share your data with third parties</li>
                                <li>You can request deletion of your data at any time</li>
                              </ul>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-indigo-600">7. Limitation of Liability</h3>
                              <p className="mb-3">
                                To the maximum extent permitted by law, we shall not be liable for any indirect,
                                incidental, special, consequential, or punitive damages, including without limitation,
                                loss of profits, data, use, goodwill, or other intangible losses.
                              </p>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-teal-600">8. Contact Information</h3>
                              <p className="mb-3">
                                If you have any questions about these Terms and Conditions, please contact us:
                              </p>
                              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p>
                                  <strong>Email:</strong> support@derivanalysis.com
                                </p>
                                <p>
                                  <strong>Phone:</strong> +1 (555) 123-4567
                                </p>
                                <p>
                                  <strong>Address:</strong> 123 Trading Street, Financial District, NY 10001
                                </p>
                              </div>
                            </section>

                            <Separator />

                            <section>
                              <h3 className="font-semibold text-lg mb-3 text-gray-600">9. Changes to Terms</h3>
                              <p className="mb-3">
                                We reserve the right to modify these terms at any time. Changes will be effective
                                immediately upon posting. Your continued use of the Service after changes constitutes
                                acceptance of the new terms.
                              </p>
                            </section>

                            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-sm text-blue-700 dark:text-blue-400">
                                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                              </p>
                              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                By using our Service, you acknowledge that you have read, understood, and agree to be
                                bound by these Terms and Conditions.
                              </p>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </label>
                  <p className="text-xs text-gray-500">Required to access the premium platform</p>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !termsAccepted}
                className={cn(
                  "w-full h-12 text-lg font-semibold transition-all duration-300",
                  "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                  "shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Access Premium Platform
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <Card
          className={cn(
            "backdrop-blur-xl border transition-all duration-300",
            isDark
              ? "bg-gray-900/60 border-purple-500/20 hover:border-purple-500/40"
              : "bg-white/80 border-purple-200/50 hover:border-purple-300/70",
            "shadow-xl hover:shadow-2xl",
          )}
        >
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Users className="h-5 w-5" />
              Need Help? Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRestricted && (
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                  Direct links may not work in this app. Use the contact information below to reach us.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleWhatsAppClick}
                className={cn(
                  "h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
                  "shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300",
                )}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                WhatsApp
                {!isRestricted && <ExternalLink className="h-4 w-4 ml-2" />}
              </Button>

              <Button
                onClick={handleTelegramClick}
                className={cn(
                  "h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
                  "shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300",
                )}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Telegram
                {!isRestricted && <ExternalLink className="h-4 w-4 ml-2" />}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Or call us directly:</p>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="font-mono text-lg">{phoneNumber}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  Since direct links don't work in this app, please use the information below to contact us.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="font-mono">{phoneNumber}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(phoneNumber, "phone")}
                      className="h-8"
                    >
                      {copiedPhone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Message Template
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{whatsappMessage}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(whatsappMessage, "message")}
                      className="w-full h-8"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>Steps to contact us:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Copy the phone number above</li>
                    <li>Open WhatsApp or your phone app</li>
                    <li>Paste the number and send the message</li>
                  </ol>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>Global</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Trusted</span>
            </div>
          </div>
          <p>© 2025 Deriv Analysis Tool. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
