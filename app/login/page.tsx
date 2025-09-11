"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { TrendingUp, MessageCircle, Send, AlertCircle, Copy, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsDialogOpen, setTermsDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [contactType, setContactType] = useState<"whatsapp" | "telegram">("whatsapp")
  const { login } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const phoneNumber = "+254787570246"
  const message = "I would like to purchase deriv analysis tool logins"

  // Detect if we're in a restricted environment (TikTok, Instagram, Facebook, etc.)
  const isRestrictedEnvironment = () => {
    if (typeof window === "undefined") return false

    const userAgent = window.navigator.userAgent.toLowerCase()
    const restrictedApps = ["tiktok", "instagram", "facebook", "fbav", "fban", "twitter", "snapchat", "linkedin"]

    return restrictedApps.some((app) => userAgent.includes(app))
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive",
        duration: 2000,
      })
    }
  }

  const openWhatsApp = () => {
    if (isRestrictedEnvironment()) {
      setContactType("whatsapp")
      setContactDialogOpen(true)
      return
    }

    const encodedMessage = encodeURIComponent(message)
    const phoneNumberClean = phoneNumber.replace(/\D/g, "")

    // Try different WhatsApp URLs
    const whatsappUrls = [
      `whatsapp://send?phone=${phoneNumberClean}&text=${encodedMessage}`,
      `https://wa.me/${phoneNumberClean}?text=${encodedMessage}`,
      `https://api.whatsapp.com/send?phone=${phoneNumberClean}&text=${encodedMessage}`,
    ]

    let urlIndex = 0

    const tryNextUrl = () => {
      if (urlIndex < whatsappUrls.length) {
        try {
          window.open(whatsappUrls[urlIndex], "_blank")
          urlIndex++

          // If app doesn't open within 2 seconds, try next URL
          setTimeout(() => {
            if (urlIndex < whatsappUrls.length) {
              tryNextUrl()
            } else {
              // Show contact dialog as final fallback
              setContactType("whatsapp")
              setContactDialogOpen(true)
            }
          }, 2000)
        } catch (error) {
          tryNextUrl()
        }
      } else {
        setContactType("whatsapp")
        setContactDialogOpen(true)
      }
    }

    tryNextUrl()
  }

  const openTelegram = () => {
    if (isRestrictedEnvironment()) {
      setContactType("telegram")
      setContactDialogOpen(true)
      return
    }

    const encodedMessage = encodeURIComponent(message)
    const phoneNumberClean = phoneNumber.replace(/\D/g, "")

    // Try different Telegram URLs
    const telegramUrls = [
      `tg://msg?to=${phoneNumberClean}&text=${encodedMessage}`,
      `https://t.me/${phoneNumberClean}?text=${encodedMessage}`,
      `https://telegram.me/${phoneNumberClean}?text=${encodedMessage}`,
    ]

    let urlIndex = 0

    const tryNextUrl = () => {
      if (urlIndex < telegramUrls.length) {
        try {
          window.open(telegramUrls[urlIndex], "_blank")
          urlIndex++

          // If app doesn't open within 2 seconds, try next URL
          setTimeout(() => {
            if (urlIndex < telegramUrls.length) {
              tryNextUrl()
            } else {
              // Show contact dialog as final fallback
              setContactType("telegram")
              setContactDialogOpen(true)
            }
          }, 2000)
        } catch (error) {
          tryNextUrl()
        }
      } else {
        setContactType("telegram")
        setContactDialogOpen(true)
      }
    }

    tryNextUrl()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions to continue")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await login(username, password)
      if (success) {
        router.push("/analyzer")
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const acceptTerms = () => {
    setTermsAccepted(true)
    setTermsDialogOpen(false)
    toast({
      title: "Terms Accepted",
      description: "You can now log in to the platform",
      duration: 2000,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/25">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Deriv Analysis Tool</h1>
            <p className="text-gray-300">Professional Trading Signals & Analysis</p>
          </div>
        </div>

        {/* Pricing Card */}
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Premium Access</CardTitle>
            <CardDescription className="text-gray-300">Get professional trading signals and analysis</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              $85
            </div>
            <p className="text-gray-400 text-sm">One-time payment for lifetime access</p>
          </CardContent>
        </Card>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={openWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white h-12 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </Button>
          <Button
            onClick={openTelegram}
            className="bg-blue-600 hover:bg-blue-700 text-white h-12 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <Send className="h-5 w-5" />
            Telegram
          </Button>
        </div>

        {/* Login Form */}
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white text-center">Login to Your Account</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Enter your credentials to access the analysis tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="border-gray-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the{" "}
                    <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-purple-400 hover:text-purple-300 underline">
                          Terms & Conditions
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-center text-purple-400">
                            Terms & Conditions for Deriv Analysis Tool Logins
                          </DialogTitle>
                          <DialogDescription className="text-center text-gray-300">
                            Last Updated: 11 September 2025
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 text-sm">
                          <p className="text-gray-300">
                            Welcome to DerivAnalysisTool.com. By creating an account and logging in, you agree to comply
                            with and be bound by the following Terms & Conditions. Please read them carefully before
                            using our service.
                          </p>

                          <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                              <h3 className="font-bold text-blue-400 mb-2">1. Acceptance of Terms</h3>
                              <p className="text-gray-300">By registering or logging in, you confirm that you:</p>
                              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
                                <li>Are at least 18 years old.</li>
                                <li>Agree to these Terms & Conditions and our Privacy Policy.</li>
                                <li>Will use this tool only for lawful purposes.</li>
                              </ul>
                            </div>

                            <div className="border-l-4 border-green-500 pl-4">
                              <h3 className="font-bold text-green-400 mb-2">2. Account Responsibility</h3>
                              <ul className="list-disc list-inside space-y-1 text-gray-300">
                                <li>
                                  You are responsible for maintaining the confidentiality of your login details
                                  (username & password).
                                </li>
                                <li>You agree not to share, sell, or transfer your login credentials.</li>
                                <li>Any activity under your account will be considered your responsibility.</li>
                              </ul>
                            </div>

                            <div className="border-l-4 border-yellow-500 pl-4">
                              <h3 className="font-bold text-yellow-400 mb-2">3. Use of the Tool</h3>
                              <ul className="list-disc list-inside space-y-1 text-gray-300">
                                <li>
                                  The Deriv Analysis Tool provides market analysis and insights but does not guarantee
                                  profits or prevent losses.
                                </li>
                                <li>Trading involves risk; you are solely responsible for your trading decisions.</li>
                                <li>
                                  The tool must not be used for fraudulent activities, bots not approved by us, or any
                                  illegal purpose.
                                </li>
                              </ul>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-4">
                              <h3 className="font-bold text-purple-400 mb-2">4. Login Access</h3>
                              <ul className="list-disc list-inside space-y-1 text-gray-300">
                                <li>
                                  We reserve the right to suspend or terminate your account if we detect misuse, sharing
                                  of credentials, or violation of these Terms.
                                </li>
                                <li>
                                  Access may be limited or denied at any time without prior notice for security reasons.
                                </li>
                              </ul>
                            </div>

                            <div className="border-l-4 border-red-500 pl-4">
                              <h3 className="font-bold text-red-400 mb-2">5. Payments & Subscriptions</h3>
                              <ul className="list-disc list-inside space-y-1 text-gray-300">
                                <li>
                                  If login access is subscription-based, you agree to pay all applicable fees on time.
                                </li>
                                <li>
                                  No refunds will be issued once analysis access has been granted, unless required by
                                  law.
                                </li>
                              </ul>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                              <h3 className="font-bold text-orange-400 mb-2">6. Limitation of Liability</h3>
                              <ul className="list-disc list-inside space-y-1 text-gray-300">
                                <li>
                                  We are not responsible for any losses, damages, or liabilities resulting from the use
                                  of this tool.
                                </li>
                                <li>
                                  Analysis results are for educational and informational purposes only, not financial
                                  advice.
                                </li>
                              </ul>
                            </div>

                            <div className="border-l-4 border-pink-500 pl-4">
                              <h3 className="font-bold text-pink-400 mb-2">7. Changes to Terms</h3>
                              <p className="text-gray-300">
                                We may update these Terms & Conditions at any time. Continued use of the tool means you
                                accept any changes.
                              </p>
                            </div>

                            <div className="border-l-4 border-cyan-500 pl-4">
                              <h3 className="font-bold text-cyan-400 mb-2">8. Contact Information</h3>
                              <p className="text-gray-300 mb-2">
                                For any questions about these Terms & Conditions, please contact us at:
                              </p>
                              <div className="space-y-1 text-gray-300">
                                <p>📧 Email: support@derivanalysistool.com</p>
                                <p>📞 Phone: +254 787 570246</p>
                                <p>🌐 Website: https://derivanalysistool.com</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center pt-4">
                            <Button
                              onClick={acceptTerms}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2"
                            >
                              Accept Terms & Conditions
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </label>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 font-semibold"
                disabled={isLoading || !termsAccepted}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Dialog */}
        <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
          <DialogContent className="bg-gray-900 border-purple-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {contactType === "whatsapp" ? (
                  <>
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Contact via WhatsApp
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 text-blue-500" />
                    Contact via Telegram
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                External links are restricted in this app. Please copy the information below and contact us manually.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Phone Number:</Label>
                <div className="flex items-center gap-2">
                  <Input value={phoneNumber} readOnly className="bg-gray-800 border-gray-600 text-white" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(phoneNumber, "Phone number")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">Message:</Label>
                <div className="flex items-start gap-2">
                  <textarea
                    value={message}
                    readOnly
                    className="flex-1 min-h-[60px] bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2 text-sm resize-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(message, "Message")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 mt-1"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-white flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  How to contact us:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                  <li>Copy the phone number and message above</li>
                  <li>Open {contactType === "whatsapp" ? "WhatsApp" : "Telegram"} on your device</li>
                  <li>Start a new chat with the phone number</li>
                  <li>Paste and send the message</li>
                </ol>
              </div>

              <Button onClick={() => setContactDialogOpen(false)} className="w-full bg-purple-600 hover:bg-purple-700">
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
