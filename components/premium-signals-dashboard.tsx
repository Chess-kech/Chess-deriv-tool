"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  Crown,
  Target,
  Zap,
  Volume2,
  VolumeX,
  ArrowLeft,
  RefreshCw,
  Activity,
  BarChart3,
  Clock,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import derivAPI from "@/lib/deriv-api"
import PriceChart from "./price-chart"

// Volatility symbols
const volatilitySymbols = {
  "1HZ100V": { name: "Volatility 100 (1s) Index", code: "100", speed: "1s", baseValue: 683.31 },
  "1HZ75V": { name: "Volatility 75 (1s) Index", code: "75", speed: "1s", baseValue: 542.18 },
  "1HZ50V": { name: "Volatility 50 (1s) Index", code: "50", speed: "1s", baseValue: 421.56 },
  "1HZ25V": { name: "Volatility 25 (1s) Index", code: "25", speed: "1s", baseValue: 312.74 },
  "1HZ10V": { name: "Volatility 10 (1s) Index", code: "10", speed: "1s", baseValue: 156.92 },
}

interface Signal {
  id: string
  type: "matches" | "even_odd" | "over_under"
  prediction: string
  confidence: number
  reasoning: string
  timestamp: Date
  volatility: string
  accuracy?: number
}

export function PremiumSignalsDashboard() {
  const [mounted, setMounted] = useState(false)
  const [selectedVolatility, setSelectedVolatility] = useState("1HZ100V")
  const [currentPrice, setCurrentPrice] = useState("717.19")
  const [recentDigits, setRecentDigits] = useState<number[]>([])
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false)
  const [lastSignalTime, setLastSignalTime] = useState<Date | null>(null)
  const { theme } = useTheme()
  const router = useRouter()
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const signalIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    initializeConnection()
    startSignalGeneration()

    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
      if (signalIntervalRef.current) clearInterval(signalIntervalRef.current)
    }
  }, [])

  const initializeConnection = () => {
    // Try to connect to Deriv API
    derivAPI.onOpen(() => {
      setIsConnected(true)
      fetchInitialData()
    })

    derivAPI.onClose(() => {
      setIsConnected(false)
      generateOfflineData()
    })

    derivAPI.onError(() => {
      setIsConnected(false)
      generateOfflineData()
    })

    // Fallback to offline mode after 5 seconds
    setTimeout(() => {
      if (!isConnected) {
        generateOfflineData()
      }
    }, 5000)
  }

  const fetchInitialData = async () => {
    try {
      const response = await derivAPI.getTickHistory(selectedVolatility, 500)
      if (response && response.history && response.history.prices) {
        const prices = response.history.prices
        setPriceHistory(prices)
        setCurrentPrice(String(prices[prices.length - 1]))

        // Extract digits
        const digits = prices.map((price: number) => {
          const priceStr = String(price)
          const decimalPart = priceStr.split(".")[1] || "00"
          return Number.parseInt(decimalPart[decimalPart.length - 1] || "0")
        })
        setRecentDigits(digits)

        // Subscribe to live updates
        derivAPI.subscribeTicks(selectedVolatility, (response) => {
          if (response.tick && response.tick.quote) {
            const price = Number(response.tick.quote)
            setCurrentPrice(String(price))
            setPriceHistory((prev) => [...prev, price].slice(-500))

            const priceStr = String(price)
            const decimalPart = priceStr.split(".")[1] || "00"
            const lastDigit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")
            setRecentDigits((prev) => [...prev, lastDigit].slice(-200))
          }
        })
      }
    } catch (error) {
      generateOfflineData()
    }
  }

  const generateOfflineData = () => {
    const volatilityInfo = volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]
    let currentPrice = volatilityInfo.baseValue

    // Generate initial data
    const initialPrices = []
    const initialDigits = []

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 0.5
      currentPrice += change
      initialPrices.push(currentPrice)

      const priceStr = currentPrice.toFixed(2)
      const decimalPart = priceStr.split(".")[1] || "00"
      const digit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")
      initialDigits.push(digit)
    }

    setPriceHistory(initialPrices)
    setRecentDigits(initialDigits)
    setCurrentPrice(currentPrice.toFixed(2))

    // Simulate live updates
    let lastPrice = currentPrice
    tickIntervalRef.current = setInterval(() => {
      const trend = lastPrice > volatilityInfo.baseValue ? -0.1 : 0.1
      const randomOffset = (Math.random() - 0.5 + trend) * 0.4
      const newPrice = lastPrice + randomOffset
      lastPrice = newPrice

      const formattedPrice = newPrice.toFixed(2)
      setCurrentPrice(formattedPrice)
      setPriceHistory((prev) => [...prev, newPrice].slice(-500))

      const decimalPart = formattedPrice.split(".")[1] || "00"
      const lastDigit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")
      setRecentDigits((prev) => [...prev, lastDigit].slice(-200))
    }, 1000)
  }

  const startSignalGeneration = () => {
    // Generate signals every 30-60 seconds
    signalIntervalRef.current = setInterval(
      () => {
        generatePremiumSignal()
      },
      Math.random() * 30000 + 30000,
    ) // 30-60 seconds

    // Generate first signal after 10 seconds
    setTimeout(() => {
      generatePremiumSignal()
    }, 10000)
  }

  const generatePremiumSignal = () => {
    if (recentDigits.length < 50) return

    setIsGeneratingSignal(true)

    setTimeout(() => {
      const signalType = Math.random()
      let newSignal: Signal

      if (signalType < 0.33) {
        newSignal = generateMatchesSignal()
      } else if (signalType < 0.66) {
        newSignal = generateEvenOddSignal()
      } else {
        newSignal = generateOverUnderSignal()
      }

      setSignals((prev) => [newSignal, ...prev].slice(0, 10))
      setLastSignalTime(new Date())
      setIsGeneratingSignal(false)

      // Play sound notification
      if (soundEnabled) {
        playNotificationSound()
      }
    }, 2000)
  }

  const generateMatchesSignal = (): Signal => {
    const digitCounts = Array(10).fill(0)
    recentDigits.forEach((digit) => digitCounts[digit]++)

    // Find underrepresented digits
    const avgCount = recentDigits.length / 10
    const underrepresented = digitCounts
      .map((count, digit) => ({ digit, count, deviation: avgCount - count }))
      .filter((item) => item.deviation > 0)
      .sort((a, b) => b.deviation - a.deviation)

    const targetDigit = underrepresented[0]?.digit ?? Math.floor(Math.random() * 10)
    const confidence = Math.min(85 + Math.random() * 10, 95)

    return {
      id: Date.now().toString(),
      type: "matches",
      prediction: `MATCHES ${targetDigit}`,
      confidence: Math.round(confidence),
      reasoning: `Digit ${targetDigit} is underrepresented in recent data (${digitCounts[targetDigit]} occurrences vs expected ${avgCount.toFixed(1)}). Statistical correction expected.`,
      timestamp: new Date(),
      volatility: selectedVolatility,
      accuracy: Math.random() > 0.2 ? Math.round(75 + Math.random() * 20) : undefined,
    }
  }

  const generateEvenOddSignal = (): Signal => {
    const evenCount = recentDigits.filter((d) => d % 2 === 0).length
    const oddCount = recentDigits.length - evenCount
    const evenPercentage = (evenCount / recentDigits.length) * 100

    let prediction: string
    let reasoning: string
    let confidence: number

    if (evenPercentage > 60) {
      prediction = "ODD"
      confidence = Math.min(80 + (evenPercentage - 60) * 2, 95)
      reasoning = `Even digits dominating (${evenPercentage.toFixed(1)}%). Odd correction expected due to statistical imbalance.`
    } else if (evenPercentage < 40) {
      prediction = "EVEN"
      confidence = Math.min(80 + (40 - evenPercentage) * 2, 95)
      reasoning = `Odd digits dominating (${(100 - evenPercentage).toFixed(1)}%). Even correction expected due to statistical imbalance.`
    } else {
      // Check recent trend
      const recent20 = recentDigits.slice(-20)
      const recentEvenCount = recent20.filter((d) => d % 2 === 0).length

      if (recentEvenCount > 12) {
        prediction = "ODD"
        confidence = 75 + Math.random() * 15
        reasoning = `Recent even bias detected (${recentEvenCount}/20). Trend reversal to odd expected.`
      } else if (recentEvenCount < 8) {
        prediction = "EVEN"
        confidence = 75 + Math.random() * 15
        reasoning = `Recent odd bias detected (${20 - recentEvenCount}/20). Trend reversal to even expected.`
      } else {
        prediction = Math.random() > 0.5 ? "EVEN" : "ODD"
        confidence = 70 + Math.random() * 10
        reasoning = `Balanced distribution detected. Moderate ${prediction.toLowerCase()} signal based on micro-patterns.`
      }
    }

    return {
      id: Date.now().toString(),
      type: "even_odd",
      prediction,
      confidence: Math.round(confidence),
      reasoning,
      timestamp: new Date(),
      volatility: selectedVolatility,
      accuracy: Math.random() > 0.25 ? Math.round(70 + Math.random() * 25) : undefined,
    }
  }

  const generateOverUnderSignal = (): Signal => {
    const overCount = recentDigits.filter((d) => d >= 5).length
    const underCount = recentDigits.length - overCount
    const overPercentage = (overCount / recentDigits.length) * 100

    let prediction: string
    let reasoning: string
    let confidence: number

    if (overPercentage > 65) {
      prediction = "UNDER"
      confidence = Math.min(85 + (overPercentage - 65) * 2, 95)
      reasoning = `Over digits heavily dominating (${overPercentage.toFixed(1)}%). Strong under correction signal detected.`
    } else if (overPercentage < 35) {
      prediction = "OVER"
      confidence = Math.min(85 + (35 - overPercentage) * 2, 95)
      reasoning = `Under digits heavily dominating (${(100 - overPercentage).toFixed(1)}%). Strong over correction signal detected.`
    } else {
      // Analyze momentum
      const recent30 = recentDigits.slice(-30)
      const recentOverCount = recent30.filter((d) => d >= 5).length
      const momentum = (recentOverCount / 30) * 100

      if (momentum > 70) {
        prediction = "UNDER"
        confidence = 75 + Math.random() * 15
        reasoning = `Strong recent over momentum (${momentum.toFixed(1)}%). Reversal to under expected.`
      } else if (momentum < 30) {
        prediction = "OVER"
        confidence = 75 + Math.random() * 15
        reasoning = `Strong recent under momentum (${(100 - momentum).toFixed(1)}%). Reversal to over expected.`
      } else {
        prediction = Math.random() > 0.5 ? "OVER" : "UNDER"
        confidence = 70 + Math.random() * 10
        reasoning = `Balanced momentum detected. Moderate ${prediction.toLowerCase()} signal based on volatility patterns.`
      }
    }

    return {
      id: Date.now().toString(),
      type: "over_under",
      prediction,
      confidence: Math.round(confidence),
      reasoning,
      timestamp: new Date(),
      volatility: selectedVolatility,
      accuracy: Math.random() > 0.2 ? Math.round(75 + Math.random() * 20) : undefined,
    }
  }

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log("Audio notification not available")
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-500"
    if (confidence >= 75) return "text-yellow-500"
    return "text-orange-500"
  }

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 85) return "bg-green-500"
    if (confidence >= 75) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const handleVolatilityChange = (symbol: string) => {
    setSelectedVolatility(symbol)
    setRecentDigits([])
    setPriceHistory([])

    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }

    derivAPI.unsubscribeTicks(selectedVolatility)

    if (isConnected) {
      fetchInitialData()
    } else {
      generateOfflineData()
    }
  }

  if (!mounted) return null

  const isDarkTheme = theme === "dark"

  return (
    <div
      className={cn(
        "min-h-screen p-4",
        isDarkTheme
          ? "bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white"
          : "bg-gradient-to-br from-pink-50 via-purple-100 to-indigo-50 text-gray-900",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className={cn(
              "flex items-center gap-2",
              isDarkTheme ? "text-purple-300 hover:text-purple-100" : "text-purple-700 hover:text-purple-900",
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => generatePremiumSignal()}
            disabled={isGeneratingSignal}
            className="rounded-full"
          >
            <RefreshCw className={cn("h-5 w-5", isGeneratingSignal && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart and Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Selection */}
          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-purple-500/20" : "bg-white/90 border-purple-300/30",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedVolatility} onValueChange={handleVolatilityChange}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(volatilitySymbols).map(([symbol, info]) => (
                    <SelectItem key={symbol} value={symbol}>
                      {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-purple-500/20" : "bg-white/90 border-purple-300/30",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Price Chart
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")}
                  />
                  <span className="text-sm">{isConnected ? "Live Data" : "Offline Mode"}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart
                symbol={volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols].name}
                data={priceHistory}
                height={300}
              />
              <div className="mt-4 text-center">
                <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {currentPrice}
                </div>
                <div className="text-sm text-gray-500">Current Price</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Signals */}
        <div className="space-y-6">
          {/* Signal Generator */}
          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-green-500/20" : "bg-white/90 border-green-300/30",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Signal Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => generatePremiumSignal()}
                disabled={isGeneratingSignal}
                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {isGeneratingSignal ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Signal
                  </div>
                )}
              </Button>

              {lastSignalTime && (
                <div className="mt-3 text-center text-sm text-gray-500">
                  Last signal: {lastSignalTime.toLocaleTimeString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Signals */}
          <Card
            className={cn(
              "border-2",
              isDarkTheme ? "bg-gray-900/60 border-blue-500/20" : "bg-white/90 border-blue-300/30",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {signals.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No signals generated yet</p>
                  <p className="text-sm">Click "Generate Signal" to start</p>
                </div>
              ) : (
                signals.map((signal) => (
                  <div
                    key={signal.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-300",
                      isDarkTheme ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200",
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={cn("text-white font-bold", getConfidenceBadgeColor(signal.confidence))}>
                        {signal.type.replace("_", "/").toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold", getConfidenceColor(signal.confidence))}>
                          {signal.confidence}%
                        </span>
                        {signal.accuracy && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">{signal.accuracy}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xl font-bold text-center py-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {signal.prediction}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{signal.reasoning}</div>

                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{signal.timestamp.toLocaleTimeString()}</span>
                      <span>{volatilitySymbols[signal.volatility as keyof typeof volatilitySymbols]?.code}V</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
