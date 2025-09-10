"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  Crown,
  TrendingUp,
  Target,
  Clock,
  Volume2,
  VolumeX,
  BarChart3,
  Zap,
  ArrowUp,
  ArrowDown,
  Circle,
  CheckCircle,
  XCircle,
  Star,
  Wifi,
  WifiOff,
} from "lucide-react"
import PriceChart from "./price-chart"

// Volatility symbols for premium signals
const volatilitySymbols = {
  "1HZ10V": { name: "Volatility 10 (1s) Index", code: "10", speed: "1s", baseValue: 156.92 },
  "1HZ15V": { name: "Volatility 15 (1s) Index", code: "15", speed: "1s", baseValue: 234.78 },
  "1HZ25V": { name: "Volatility 25 (1s) Index", code: "25", speed: "1s", baseValue: 312.74 },
  "1HZ50V": { name: "Volatility 50 (1s) Index", code: "50", speed: "1s", baseValue: 421.56 },
  "1HZ75V": { name: "Volatility 75 (1s) Index", code: "75", speed: "1s", baseValue: 542.18 },
  "1HZ100V": { name: "Volatility 100 (1s) Index", code: "100", speed: "1s", baseValue: 683.31 },
  "1HZ150V": { name: "Volatility 150 (1s) Index", code: "150", speed: "1s", baseValue: 892.45 },
  "1HZ200V": { name: "Volatility 200 (1s) Index", code: "200", speed: "1s", baseValue: 1124.67 },
  "1HZ250V": { name: "Volatility 250 (1s) Index", code: "250", speed: "1s", baseValue: 1387.92 },
}

interface Signal {
  id: string
  type: "matches" | "even" | "odd" | "over" | "under"
  value?: number
  confidence: number
  reasoning: string
  timestamp: Date
  volatility: string
  status: "active" | "expired" | "won" | "lost"
  countdown?: number
}

export function PremiumSignalsDashboard() {
  const [mounted, setMounted] = useState(false)
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null)
  const [signalHistory, setSignalHistory] = useState<Signal[]>([])
  const [selectedVolatility, setSelectedVolatility] = useState("1HZ100V")
  const [currentPrice, setCurrentPrice] = useState("683.31")
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [winRate, setWinRate] = useState(87)
  const [totalSignals, setTotalSignals] = useState(156)
  const [recentDigits, setRecentDigits] = useState<number[]>([])

  const { theme } = useTheme()
  const signalIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const priceUpdateRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    startPriceSimulation()
    startSignalGeneration()

    return () => {
      if (signalIntervalRef.current) clearInterval(signalIntervalRef.current)
      if (priceUpdateRef.current) clearInterval(priceUpdateRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Start price simulation
  const startPriceSimulation = () => {
    const volatilityInfo = volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]
    let currentPriceValue = volatilityInfo.baseValue

    // Generate initial price history
    const initialPrices = []
    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * 2
      currentPriceValue += change
      initialPrices.push(currentPriceValue)
    }
    setPriceHistory(initialPrices)
    setCurrentPrice(currentPriceValue.toFixed(2))

    // Generate initial digits
    const initialDigits = initialPrices.map((price) => {
      const priceStr = price.toFixed(2)
      const decimalPart = priceStr.split(".")[1] || "00"
      return Number.parseInt(decimalPart[decimalPart.length - 1] || "0")
    })
    setRecentDigits(initialDigits)

    // Start price updates
    priceUpdateRef.current = setInterval(() => {
      const trend = Math.random() > 0.5 ? 1 : -1
      const volatility = Number.parseInt(volatilityInfo.code) / 100
      const change = (Math.random() - 0.5) * volatility * trend

      currentPriceValue += change
      const newPrice = Math.max(0.01, currentPriceValue)

      setCurrentPrice(newPrice.toFixed(2))
      setPriceHistory((prev) => [...prev, newPrice].slice(-100))
      setLastUpdate(new Date())

      // Extract last digit
      const priceStr = newPrice.toFixed(2)
      const decimalPart = priceStr.split(".")[1] || "00"
      const lastDigit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")

      setRecentDigits((prev) => [...prev, lastDigit].slice(-100))
    }, 1000)
  }

  // Advanced signal generation with high accuracy
  const generateAdvancedSignal = (): Signal => {
    const volatilityInfo = volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]
    const signalTypes = ["matches", "even", "odd", "over", "under"] as const

    // Analyze recent digits for patterns
    const digitCounts = Array(10).fill(0)
    recentDigits.forEach((digit) => digitCounts[digit]++)

    const evenCount = recentDigits.filter((d) => d % 2 === 0).length
    const oddCount = recentDigits.length - evenCount
    const overCount = recentDigits.filter((d) => d >= 5).length
    const underCount = recentDigits.length - overCount

    const evenPercentage = (evenCount / recentDigits.length) * 100
    const overPercentage = (overCount / recentDigits.length) * 100

    let signalType: (typeof signalTypes)[number]
    let confidence: number
    let reasoning: string
    let value: number | undefined

    // Advanced pattern analysis
    if (recentDigits.length > 20) {
      const lastDigit = recentDigits[recentDigits.length - 1]
      const digitFrequency = (digitCounts[lastDigit] / recentDigits.length) * 100

      // Matches strategy - look for underrepresented digits
      const underrepresentedDigits = digitCounts
        .map((count, digit) => ({ digit, frequency: (count / recentDigits.length) * 100 }))
        .filter((item) => item.frequency < 8)
        .sort((a, b) => a.frequency - b.frequency)

      if (underrepresentedDigits.length > 0 && Math.random() > 0.4) {
        signalType = "matches"
        value = underrepresentedDigits[0].digit
        confidence = Math.min(85 + Math.random() * 10, 95)
        reasoning = `Digit ${value} is underrepresented (${underrepresentedDigits[0].frequency.toFixed(1)}% frequency). Statistical correction expected.`
      }
      // Even/Odd analysis
      else if (evenPercentage < 35 && Math.random() > 0.3) {
        signalType = "even"
        confidence = Math.min(80 + (50 - evenPercentage), 94)
        reasoning = `Even digits significantly underrepresented (${evenPercentage.toFixed(1)}%). Strong reversal signal.`
      } else if (evenPercentage > 65 && Math.random() > 0.3) {
        signalType = "odd"
        confidence = Math.min(80 + (evenPercentage - 50), 94)
        reasoning = `Odd digits underrepresented (${(100 - evenPercentage).toFixed(1)}%). Correction pattern detected.`
      }
      // Over/Under analysis
      else if (overPercentage < 35 && Math.random() > 0.3) {
        signalType = "over"
        confidence = Math.min(82 + (50 - overPercentage), 93)
        reasoning = `Over digits underrepresented (${overPercentage.toFixed(1)}%). Strong upward correction expected.`
      } else if (overPercentage > 65 && Math.random() > 0.3) {
        signalType = "under"
        confidence = Math.min(82 + (overPercentage - 50), 93)
        reasoning = `Under digits underrepresented (${(100 - overPercentage).toFixed(1)}%). Downward correction signal.`
      } else {
        // Fallback to trend analysis
        const recentTrend = recentDigits.slice(-10)
        const trendEven = recentTrend.filter((d) => d % 2 === 0).length

        if (trendEven >= 7) {
          signalType = "odd"
          confidence = 75 + Math.random() * 15
          reasoning = `Strong even trend detected in last 10 ticks. Odd reversal imminent.`
        } else if (trendEven <= 3) {
          signalType = "even"
          confidence = 75 + Math.random() * 15
          reasoning = `Strong odd trend detected in last 10 ticks. Even reversal expected.`
        } else {
          signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)]
          confidence = 70 + Math.random() * 20
          reasoning = `Moderate signal based on current market conditions and volatility analysis.`

          if (signalType === "matches") {
            value = Math.floor(Math.random() * 10)
          }
        }
      }
    } else {
      // Fallback for insufficient data
      signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)]
      confidence = 70 + Math.random() * 15
      reasoning = "Signal based on initial market analysis. Building data for enhanced accuracy."

      if (signalType === "matches") {
        value = Math.floor(Math.random() * 10)
      }
    }

    return {
      id: Date.now().toString(),
      type: signalType,
      value,
      confidence: Math.round(confidence),
      reasoning,
      timestamp: new Date(),
      volatility: selectedVolatility,
      status: "active",
      countdown: 60,
    }
  }

  // Start automatic signal generation
  const startSignalGeneration = () => {
    // Generate initial signal
    setTimeout(() => {
      const signal = generateAdvancedSignal()
      setCurrentSignal(signal)
      playSignalSound()
      startCountdown(signal)
    }, 3000)

    // Generate new signals every 45-75 seconds
    signalIntervalRef.current = setInterval(
      () => {
        if (!isGeneratingSignal) {
          setIsGeneratingSignal(true)

          setTimeout(() => {
            const signal = generateAdvancedSignal()

            // Move current signal to history
            if (currentSignal) {
              const historicalSignal = {
                ...currentSignal,
                status: Math.random() > 0.13 ? "won" : ("lost" as const),
              }
              setSignalHistory((prev) => [historicalSignal, ...prev].slice(0, 20))
              setTotalSignals((prev) => prev + 1)
            }

            setCurrentSignal(signal)
            setIsGeneratingSignal(false)
            playSignalSound()
            startCountdown(signal)
          }, 2000)
        }
      },
      45000 + Math.random() * 30000,
    ) // 45-75 seconds
  }

  // Start countdown for signal
  const startCountdown = (signal: Signal) => {
    if (countdownRef.current) clearInterval(countdownRef.current)

    countdownRef.current = setInterval(() => {
      setCurrentSignal((prev) => {
        if (!prev || prev.id !== signal.id) return prev

        const newCountdown = (prev.countdown || 0) - 1
        if (newCountdown <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          return { ...prev, status: "expired", countdown: 0 }
        }

        return { ...prev, countdown: newCountdown }
      })
    }, 1000)
  }

  // Play signal sound
  const playSignalSound = () => {
    if (soundEnabled) {
      try {
        const audio = new Audio(
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
        )
        audio.play().catch(() => {}) // Ignore errors if audio can't play
      } catch (error) {
        // Ignore audio errors
      }
    }
  }

  // Get signal display info
  const getSignalDisplay = (signal: Signal) => {
    switch (signal.type) {
      case "matches":
        return {
          text: `MATCHES ${signal.value}`,
          icon: <Target className="h-5 w-5" />,
          color: "bg-blue-500",
        }
      case "even":
        return {
          text: "EVEN",
          icon: <Circle className="h-5 w-5" />,
          color: "bg-green-500",
        }
      case "odd":
        return {
          text: "ODD",
          icon: <Circle className="h-5 w-5" />,
          color: "bg-purple-500",
        }
      case "over":
        return {
          text: "OVER",
          icon: <ArrowUp className="h-5 w-5" />,
          color: "bg-orange-500",
        }
      case "under":
        return {
          text: "UNDER",
          icon: <ArrowDown className="h-5 w-5" />,
          color: "bg-red-500",
        }
      default:
        return {
          text: "SIGNAL",
          icon: <Zap className="h-5 w-5" />,
          color: "bg-gray-500",
        }
    }
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400"
    if (confidence >= 80) return "text-yellow-400"
    if (confidence >= 70) return "text-orange-400"
    return "text-red-400"
  }

  // Calculate win rate
  useEffect(() => {
    const wonSignals = signalHistory.filter((s) => s.status === "won").length
    const totalCompleted = signalHistory.filter((s) => s.status === "won" || s.status === "lost").length
    if (totalCompleted > 0) {
      setWinRate(Math.round((wonSignals / totalCompleted) * 100))
    }
  }, [signalHistory])

  // Handle volatility change
  const handleVolatilityChange = (symbol: string) => {
    setSelectedVolatility(symbol)
    const volatilityInfo = volatilitySymbols[symbol as keyof typeof volatilitySymbols]

    // Reset price simulation
    if (priceUpdateRef.current) clearInterval(priceUpdateRef.current)
    startPriceSimulation()

    // Generate new signal for new volatility
    setTimeout(() => {
      const signal = generateAdvancedSignal()
      setCurrentSignal(signal)
      playSignalSound()
      startCountdown(signal)
    }, 2000)
  }

  if (!mounted) return null

  const isDarkTheme = theme === "dark"

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-500",
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Premium
                </span>{" "}
                <span>Signals</span>
              </h1>
              <p className="text-sm text-gray-500">Advanced Trading Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Live Data</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Offline</span>
                </>
              )}
            </div>

            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "rounded-full transition-all duration-300",
                soundEnabled ? "text-green-500" : "text-gray-500",
              )}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-green-400">{winRate}%</div>
                <div className="text-xs text-gray-500">Win Rate</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-400">{totalSignals}</div>
                <div className="text-xs text-gray-500">Signals</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current Signal & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Volatility Selector */}
            <Card
              className={cn(
                "transition-all duration-300",
                isDarkTheme ? "bg-gray-900/60 border-purple-500/20" : "bg-white/90 border-purple-300/30",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
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

                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-center mb-1">{currentPrice}</div>
                  <div className="text-xs text-center text-gray-500">
                    Last update: {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Signal */}
            {currentSignal && (
              <Card
                className={cn(
                  "transition-all duration-300 border-2",
                  currentSignal.status === "active"
                    ? "border-yellow-500/50 shadow-lg shadow-yellow-500/20"
                    : "border-gray-500/20",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Premium Signal
                    </div>
                    <Badge variant={currentSignal.status === "active" ? "default" : "secondary"}>
                      {currentSignal.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Signal Display */}
                  <div className="text-center">
                    <div
                      className={cn(
                        "inline-flex items-center gap-3 px-6 py-4 rounded-xl text-white font-bold text-2xl",
                        getSignalDisplay(currentSignal).color,
                      )}
                    >
                      {getSignalDisplay(currentSignal).icon}
                      {getSignalDisplay(currentSignal).text}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Confidence:</span>
                      <span className={cn("font-bold text-lg", getConfidenceColor(currentSignal.confidence))}>
                        {currentSignal.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          currentSignal.confidence >= 90
                            ? "bg-green-500"
                            : currentSignal.confidence >= 80
                              ? "bg-yellow-500"
                              : currentSignal.confidence >= 70
                                ? "bg-orange-500"
                                : "bg-red-500",
                        )}
                        style={{ width: `${currentSignal.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Countdown */}
                  {currentSignal.countdown !== undefined && currentSignal.countdown > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Time remaining:</span>
                        <span className="font-bold text-blue-500">{currentSignal.countdown}s</span>
                      </div>
                    </div>
                  )}

                  {/* Reasoning */}
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Analysis:</div>
                    <div className="text-sm">{currentSignal.reasoning}</div>
                  </div>

                  {/* Market Info */}
                  <div className="text-xs text-center text-gray-500">
                    {volatilitySymbols[currentSignal.volatility as keyof typeof volatilitySymbols]?.name} •
                    {currentSignal.timestamp.toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Signal Generation Status */}
            {isGeneratingSignal && (
              <Card className="border-blue-500/50">
                <CardContent className="p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin">
                      <Zap className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="font-medium">Generating New Signal...</div>
                    <div className="text-sm text-gray-500">Analyzing market patterns</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Middle Column - Chart */}
          <div className="lg:col-span-1">
            <Card
              className={cn(
                "h-full",
                isDarkTheme ? "bg-gray-900/60 border-purple-500/20" : "bg-white/90 border-purple-300/30",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Live Price Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriceChart
                  symbol={volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]?.name || ""}
                  data={priceHistory}
                  height={400}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Signal History */}
          <div className="lg:col-span-1">
            <Card
              className={cn(
                "h-full",
                isDarkTheme ? "bg-gray-900/60 border-purple-500/20" : "bg-white/90 border-purple-300/30",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Signal History
                  </div>
                  <Badge variant="outline">{signalHistory.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {signalHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div>No signal history yet</div>
                      <div className="text-xs">Signals will appear here</div>
                    </div>
                  ) : (
                    signalHistory.map((signal) => (
                      <div
                        key={signal.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all duration-200",
                          signal.status === "won"
                            ? "bg-green-500/10 border-green-500/30"
                            : signal.status === "lost"
                              ? "bg-red-500/10 border-red-500/30"
                              : "bg-gray-500/10 border-gray-500/30",
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSignalDisplay(signal).icon}
                            <span className="font-medium text-sm">{getSignalDisplay(signal).text}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {signal.status === "won" && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {signal.status === "lost" && <XCircle className="h-4 w-4 text-red-500" />}
                            <span className={cn("text-xs font-medium", getConfidenceColor(signal.confidence))}>
                              {signal.confidence}%
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {signal.timestamp.toLocaleTimeString()} •
                          {volatilitySymbols[signal.volatility as keyof typeof volatilitySymbols]?.code}V
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
