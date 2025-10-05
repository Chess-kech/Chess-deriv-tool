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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  MessageCircle,
  Send,
  TrendingUp,
  FileText,
  Copy,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsDialogOpen, setTermsDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactType, setContactType] = useState<"whatsapp" | "telegram">("whatsapp")
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      setError("You must accept the Terms & Conditions to continue")
      return
    }

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

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!")
      })
      .catch(() => {
        toast.error("Failed to copy")
      })
  }

  // Check if we're in TikTok or other restricted environment
  const isRestrictedEnvironment = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    return (
      userAgent.includes("tiktok") ||
      userAgent.includes("musically") ||
      userAgent.includes("instagram") ||
      userAgent.includes("facebook") ||
      userAgent.includes("twitter")
    )
  }

  // Enhanced WhatsApp function with fallback for restricted environments
  const openWhatsApp = () => {
    const phoneNumber = "+254 787 570246"
    const message = "I would like to purchase deriv analysis tool logins"

    if (isRestrictedEnvironment()) {
      // Show contact dialog instead of trying to redirect
      setContactType("whatsapp")
      setContactDialogOpen(true)
      return
    }

    // Try normal redirect for unrestricted environments
    const whatsappUrl = `https://wa.me/254787570246?text=${encodeURIComponent(message)}`

    try {
      window.open(whatsappUrl, "_blank")
    } catch (error) {
      // Fallback to contact dialog if redirect fails
      setContactType("whatsapp")
      setContactDialogOpen(true)
    }
  }

  // Enhanced Telegram function with fallback for restricted environments
  const openTelegram = () => {
    const phoneNumber = "+254 787 570246"
    const message = "I would like to purchase deriv analysis tool logins"

    if (isRestrictedEnvironment()) {
      // Show contact dialog instead of trying to redirect
      setContactType("telegram")
      setContactDialogOpen(true)
      return
    }

    // Try normal redirect for unrestricted environments
    const telegramUrl = `https://t.me/+254787570246`

    try {
      window.open(telegramUrl, "_blank")
    } catch (error) {
      // Fallback to contact dialog if redirect fails
      setContactType("telegram")
      setContactDialogOpen(true)
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

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start space-x-3 py-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="border-white/30 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="terms" className="text-sm font-medium leading-none text-white cursor-pointer">
                    I agree to the{" "}
                    <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-purple-400 hover:text-purple-300 underline inline">
                          Terms & Conditions
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] bg-slate-900 border-white/20 text-white">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-purple-400">
                            <FileText className="h-5 w-5" />
                            Terms & Conditions for Deriv Analysis Tool Logins
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Last Updated: 11 September 2025
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                          <div className="space-y-6 text-sm">
                            <p className="text-gray-300">
                              Welcome to DerivAnalysisTool.com. By creating an account and logging in, you agree to
                              comply with and be bound by the following Terms & Conditions. Please read them carefully
                              before using our service.
                            </p>

                            <div className="space-y-4">
                              <div>
                                <h3 className="text-lg font-semibold text-purple-400 mb-2">1. Acceptance of Terms</h3>
                                <p className="text-gray-300">By registering or logging in, you confirm that you:</p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300 ml-4">
                                  <li>Are at least 18 years old.</li>
                                  <li>Agree to these Terms & Conditions and our Privacy Policy.</li>
                                  <li>Will use this tool only for lawful purposes.</li>
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-blue-400 mb-2">2. Account Responsibility</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                                  <li>
                                    You are responsible for maintaining the confidentiality of your login details
                                    (username & password).
                                  </li>
                                  <li>You agree not to share, sell, or transfer your login credentials.</li>
                                  <li>Any activity under your account will be considered your responsibility.</li>
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-green-400 mb-2">3. Use of the Tool</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                                  <li>
                                    The Deriv Analysis Tool provides market analysis and insights 
                              
                                  </li>
                                  <li>Trading involves risk; you are solely responsible for your trading decisions.</li>
                                  <li>
                                    The tool must not be used for fraudulent activities, bots not approved by us, or any
                                    illegal purpose.
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-yellow-400 mb-2">4. Login Access</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                                  <li>
                                    We reserve the right to suspend or terminate your account if we detect misuse,
                                    sharing of credentials, or violation of these Terms.
                                  </li>
                                  <li>
                                    Access may be limited or denied at any time without prior notice for security
                                    reasons.
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-red-400 mb-2">5. Payments & Subscriptions</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                                  <li>
                                    If login access is subscription-based, you agree to pay all applicable fees on time.
                                  </li>
                                  <li>
                                    No refunds will be issued once analysis access has been granted, unless required by
                                    law.
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-orange-400 mb-2">
                                  6. Limitation of Liability
                                </h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                                  <li>
                                    We are not responsible for any losses, damages, or liabilities resulting from the
                                    use of this tool.
                                  </li>
                                  <li>
                                    Analysis results are for educational and informational purposes only, not financial
                                    advice.
                                  </li>
                                </ul>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-pink-400 mb-2">7. Changes to Terms</h3>
                                <p className="text-gray-300">
                                  We may update these Terms & Conditions at any time. Continued use of the tool means
                                  you accept any changes.
                                </p>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold text-cyan-400 mb-2">8. Contact Information</h3>
                                <p className="text-gray-300 mb-2">
                                  For any questions about these Terms & Conditions, please contact us at:
                                </p>
                                <div className="space-y-1 text-gray-300 ml-4">
                                  <p>📧 Email: support@derivanalysistool.com</p>
                                  <p>📞 Phone: +254 787 570246</p>
                                  <p>🌐 Website: https://derivanalysistool.com</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                        <div className="flex justify-end pt-4">
                          <Button
                            onClick={() => {
                              setAcceptedTerms(true)
                              setTermsDialogOpen(false)
                            }}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Accept Terms
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Label>
                  <p className="text-xs text-gray-400">You must accept our terms to create an account</p>
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
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium disabled:opacity-50"
                disabled={isLoading || !acceptedTerms}
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
                  <span className="font-medium">WhatsApp</span>
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
                <p className="text-xs text-gray-400">Contact on +254787570246 us for support, account issues, or trading assistance</p>
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

      {/* Contact Information Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              {contactType === "whatsapp" ? (
                <>
                  <MessageCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400">WhatsApp Contact</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-400">Telegram Contact</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {isRestrictedEnvironment()
                ? "External links are blocked in this app. Please copy the contact details below:"
                : "Contact us directly using the information below:"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Phone Number:</Label>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-white font-mono">+254 787 570246</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("+254 787 570246")}
                  className="ml-auto h-8 w-8 p-0 hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Message to send:</Label>
              <div className="flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-white text-sm flex-1">I would like to purchase deriv analysis tool logins</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("I would like to purchase deriv analysis tool logins")}
                  className="h-8 w-8 p-0 hover:bg-white/10 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Instructions:</strong>
              </p>
              <ol className="text-sm text-gray-300 mt-2 space-y-1 list-decimal list-inside">
                <li>Copy the phone number above</li>
                <li>Open {contactType === "whatsapp" ? "WhatsApp" : "Telegram"} on your device</li>
                <li>Start a new chat with the copied number</li>
                <li>Copy and send the message above</li>
              </ol>
            </div>

            {/* Try Direct Link Button (for non-restricted environments) */}
            {!isRestrictedEnvironment() && (
              <div className="pt-2">
                <Button
                  onClick={() => {
                    const url =
                      contactType === "whatsapp"
                        ? `https://wa.me/254787570246?text=${encodeURIComponent("I would like to purchase deriv analysis tool logins")}`
                        : `https://t.me/+254787570246`
                    window.open(url, "_blank")
                    setContactDialogOpen(false)
                  }}
                  className={`w-full ${
                    contactType === "whatsapp" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open {contactType === "whatsapp" ? "WhatsApp" : "Telegram"}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
