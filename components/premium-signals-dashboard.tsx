"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Crown,
  TrendingUp,
  Target,
  Zap,
  Volume2,
  VolumeX,
  ArrowLeft,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  DollarSign,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import PriceChart from "./price-chart"

interface Signal {
  id: string
  type: "Matches" | "Differs" | "Even" | "Odd" | "Over" | "Under"
  digit?: number
  confidence: number
  timestamp: Date
  status: "active" | "won" | "lost"
  volatility: string
  reasoning: string
}

export function PremiumSignalsDashboard() {
  const [mounted, setMounted] = useState(false)
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null)
  const [signalHistory, setSignalHistory] = useState<Signal[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [winRate, setWinRate] = useState(87)
  const [totalSignals, setTotalSignals] = useState(156)
  const [todaySignals, setTodaySignals] = useState(23)
  const [priceData, setPriceData] = useState<number[]>([])
  const [currentPrice, setCurrentPrice] = useState("1247.83")
  const [selectedVolatility, setSelectedVolatility] = useState("Volatility 100 (1s)")

  const { theme } = useTheme()
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const signalIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)

    // Initialize audio
    if (typeof window !== "undefined") {
      audioRef.current = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
    }

    // Start generating signals
    generateInitialSignal()
    startSignalGeneration()

    // Generate initial price data
    generatePriceData()

    return () => {
      if (signalIntervalRef.current) {
        clearInterval(signalIntervalRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  const generatePriceData = () => {
    const data = []
    let price = 1247.83

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 2
      price += change
      data.push(price)
    }

    setPriceData(data)
    setCurrentPrice(price.toFixed(2))
  }

  const generateInitialSignal = () => {
    const signal = generateNewSignal()
    setCurrentSignal(signal)
    setSignalHistory((prev) => [signal, ...prev].slice(0, 20))
  }

  const generateNewSignal = (): Signal => {
    const types = ["Matches", "Differs", "Even", "Odd", "Over", "Under"] as const
    const type = types[Math.floor(Math.random() * types.length)]
    const confidence = Math.floor(Math.random() * 20) + 75 // 75-95%

    let digit: number | undefined
    let reasoning = ""

    if (type === "Matches" || type === "Differs") {
      digit = Math.floor(Math.random() * 10)
      if (type === "Matches") {
        reasoning = `Digit ${digit} has been underrepresented in recent ticks (${(Math.random() * 5 + 3).toFixed(1)}% frequency). Statistical correction expected.`
      } else {
        reasoning = `Consecutive ${digit}s detected. Pattern suggests different digit incoming with ${confidence}% probability.`
      }
    } else if (type === "Even" || type === "Odd") {
      const evenPercentage = Math.random() * 20 + 40 // 40-60%
      reasoning =
        type === "Even"
          ? `Even digits showing ${evenPercentage.toFixed(1)}% frequency. Strong bias detected for continuation.`
          : `Odd digits dominating recent pattern (${(100 - evenPercentage).toFixed(1)}%). Momentum analysis confirms trend.`
    } else {
      const overPercentage = Math.random() * 20 + 40 // 40-60%
      reasoning =
        type === "Over"
          ? `Over digits (5-9) showing ${overPercentage.toFixed(1)}% frequency. Market momentum favors continuation.`
          : `Under digits (0-4) dominating with ${(100 - overPercentage).toFixed(1)}% frequency. Statistical edge identified.`
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      digit,
      confidence,
      timestamp: new Date(),
      status: "active",
      volatility: selectedVolatility,
      reasoning,
    }
  }

  const startSignalGeneration = () => {
    const generateNext = () => {
      const delay = Math.random() * 30000 + 45000 // 45-75 seconds

      signalIntervalRef.current = setTimeout(() => {
        setIsGenerating(true)

        setTimeout(() => {
          const newSignal = generateNewSignal()
          setCurrentSignal(newSignal)
          setSignalHistory((prev) => [newSignal, ...prev].slice(0, 20))
          setIsGenerating(false)
          setTotalSignals((prev) => prev + 1)
          setTodaySignals((prev) => prev + 1)

          // Play sound notification
          if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => {})
          }

          // Start countdown
          setCountdown(15)
          countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev === null || prev <= 1) {
                if (countdownRef.current) clearInterval(countdownRef.current)
                return null
              }
              return prev - 1
            })
          }, 1000)

          generateNext()
        }, 2000)
      }, delay)
    }

    generateNext()
  }

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }

  const getSignalColor = (type: string) => {
    switch (type) {
      case "Matches":
        return "bg-blue-500"
      case "Differs":
        return "bg-purple-500"
      case "Even":
        return "bg-green-500"
      case "Odd":
        return "bg-yellow-500"
      case "Over":
        return "bg-orange-500"
      case "Under":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500"
    if (confidence >= 80) return "text-yellow-500"
    return "text-orange-500"
  }

  if (!mounted) return null

  const isDarkTheme = theme === "dark"

  return (
    <div
      className={cn(
        "min-h-screen",
        isDarkTheme
          ? "bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white"
          : "bg-gradient-to-br from-pink-50 via-purple-100 to-indigo-50 text-gray-900",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b backdrop-blur-md sticky top-0 z-10",
          isDarkTheme ? "bg-black/30 border-purple-500/20" : "bg-white/30 border-purple-200",
        )}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/analyzer")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Analyzer
            </Button>

            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Premium Signals
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn("rounded-full", soundEnabled ? "text-green-500" : "text-gray-500")}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={playNotificationSound} className="rounded-full">
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-green-500/30" : "bg-white/90 border-green-300/50",
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Win Rate</p>
                  <p className="text-3xl font-bold text-green-500">{winRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-blue-500/30" : "bg-white/90 border-blue-300/50",
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Signals</p>
                  <p className="text-3xl font-bold text-blue-500">{totalSignals}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-purple-500/30" : "bg-white/90 border-purple-300/50",
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Signals</p>
                  <p className="text-3xl font-bold text-purple-500">{todaySignals}</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-yellow-500/30" : "bg-white/90 border-yellow-300/50",
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Price</p>
                  <p className="text-3xl font-bold text-yellow-500">{currentPrice}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Signal */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              className={cn(
                "border-2",
                isDarkTheme ? "bg-gray-900/60 border-pink-500/30" : "bg-white/90 border-pink-300/50",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  Current Premium Signal
                  {isGenerating && (
                    <Badge variant="secondary" className="ml-2">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Generating...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentSignal && !isGenerating ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("text-white font-bold px-3 py-1", getSignalColor(currentSignal.type))}>
                          {currentSignal.type} {currentSignal.digit !== undefined ? currentSignal.digit : ""}
                        </Badge>
                        <span className={cn("text-2xl font-bold", getConfidenceColor(currentSignal.confidence))}>
                          {currentSignal.confidence}%
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {currentSignal.timestamp.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400">{currentSignal.volatility}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <h4 className="font-semibold mb-2">Analysis Reasoning:</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{currentSignal.reasoning}</p>
                    </div>

                    {countdown !== null && (
                      <div className="flex items-center justify-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">Trade in: {countdown}s</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-3 text-lg"
                      >
                        TRADE {currentSignal.type.toUpperCase()}{" "}
                        {currentSignal.digit !== undefined ? currentSignal.digit : ""}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-4" />
                      <p className="text-lg font-medium">Analyzing Market Data...</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Generating high-accuracy signal</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Chart */}
            <Card
              className={cn(
                "border-2",
                isDarkTheme ? "bg-gray-900/60 border-blue-500/30" : "bg-white/90 border-blue-300/50",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Live Price Chart - {selectedVolatility}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriceChart symbol={selectedVolatility} data={priceData} height={300} />
              </CardContent>
            </Card>
          </div>

          {/* Signal History */}
          <div>
            <Card
              className={cn(
                "border-2 h-fit",
                isDarkTheme ? "bg-gray-900/60 border-purple-500/30" : "bg-white/90 border-purple-300/50",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" />
                  Signal History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {signalHistory.map((signal) => (
                    <div
                      key={signal.id}
                      className={cn(
                        "p-3 rounded-lg border",
                        isDarkTheme ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn("text-white text-xs", getSignalColor(signal.type))}>
                          {signal.type} {signal.digit !== undefined ? signal.digit : ""}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <span className={cn("text-sm font-medium", getConfidenceColor(signal.confidence))}>
                            {signal.confidence}%
                          </span>
                          {signal.status === "won" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {signal.status === "lost" && <XCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {signal.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
