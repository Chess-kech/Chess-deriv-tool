"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Crown,
  LogOut,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  BarChart3,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Home,
} from "lucide-react"
import { SignalStrengthMeter } from "./signal-strength-meter"
import { DigitFrequencyAnalyzer } from "./digit-frequency-analyzer"
import { SignalHistoryChart } from "./signal-history-chart"
import PriceChart from "./price-chart"
import DerivChart from "./deriv-chart"
import derivAPI from "@/lib/deriv-api"
import { useRouter } from "next/navigation"

// Volatility symbols mapping
const volatilitySymbols = {
  "1HZ100V": { name: "Volatility 100 (1s) Index", code: "100", speed: "1s", baseValue: 683.31 },
  "1HZ75V": { name: "Volatility 75 (1s) Index", code: "75", speed: "1s", baseValue: 542.18 },
  "1HZ50V": { name: "Volatility 50 (1s) Index", code: "50", speed: "1s", baseValue: 421.56 },
  "1HZ25V": { name: "Volatility 25 (1s) Index", code: "25", speed: "1s", baseValue: 312.74 },
  "1HZ10V": { name: "Volatility 10 (1s) Index", code: "10", speed: "1s", baseValue: 156.92 },
  R_100: { name: "Volatility 100 Index", code: "100", speed: "1s", baseValue: 683.31 },
  R_75: { name: "Volatility 75 Index", code: "75", speed: "1s", baseValue: 542.18 },
  R_50: { name: "Volatility 50 Index", code: "50", speed: "1s", baseValue: 421.56 },
  R_25: { name: "Volatility 25 Index", code: "25", speed: "1s", baseValue: 312.74 },
  R_10: { name: "Volatility 10 Index", code: "10", speed: "1s", baseValue: 156.92 },
}

interface TickData {
  digit: number
  timestamp: number
  price: number
}

interface Signal {
  id: string
  type: "matches" | "even-odd" | "over-under"
  prediction: string
  confidence: number
  timestamp: number
  status: "active" | "hit" | "miss" | "waiting"
  actualResult?: number
  volatility?: string
}

interface PremiumSignalsDashboardProps {
  onLogout: () => void
}

export function PremiumSignalsDashboard({ onLogout }: PremiumSignalsDashboardProps) {
  const router = useRouter()
  const [ticks, setTicks] = useState<TickData[]>([])
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentTick, setCurrentTick] = useState<TickData | null>(null)
  const [volatilitySymbol, setVolatilitySymbol] = useState("1HZ100V")
  const [volatilityName, setVolatilityName] = useState("Volatility 100 (1s) Index")
  const [isLoading, setIsLoading] = useState(false)
  const [lastTickTime, setLastTickTime] = useState<Date | null>(null)
  const [tickCount, setTickCount] = useState(0)

  // Signal analysis states
  const [matchesSignal, setMatchesSignal] = useState<Signal | null>(null)
  const [evenOddSignal, setEvenOddSignal] = useState<Signal | null>(null)
  const [overUnderSignal, setOverUnderSignal] = useState<Signal | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const signalAnalysisRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize connection and audio
  useEffect(() => {
    // Initialize audio for notifications
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      audioRef.current.volume = 0.5
    }

    initializeConnection()

    return () => {
      cleanup()
    }
  }, [])

  // Handle volatility symbol changes
  useEffect(() => {
    if (volatilitySymbol) {
      handleVolatilityChange(volatilitySymbol)
    }
  }, [volatilitySymbol])

  const cleanup = () => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }
    if (signalAnalysisRef.current) {
      clearInterval(signalAnalysisRef.current)
    }
    derivAPI.unsubscribeTicks(volatilitySymbol)
  }

  const initializeConnection = () => {
    setConnectionStatus("connecting")

    derivAPI.onOpen(() => {
      console.log("✅ Premium Signals connected to Deriv API")
      setIsConnected(true)
      setConnectionStatus("connected")
      fetchInitialData()
    })

    derivAPI.onClose(() => {
      console.log("❌ Premium Signals disconnected from Deriv API")
      setIsConnected(false)
      setConnectionStatus("disconnected")
      generateOfflineData()
    })

    derivAPI.onError((error) => {
      console.error("🔥 Premium Signals API Error:", error)
      setConnectionStatus("disconnected")
      generateOfflineData()
    })

    // Start with offline data if connection takes too long
    setTimeout(() => {
      if (!isConnected) {
        console.log("Connection timeout - starting offline mode")
        generateOfflineData()
      }
    }, 5000)
  }

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      console.log("🔄 Fetching initial data for:", volatilitySymbol)

      const response = await derivAPI.getTickHistory(volatilitySymbol, 200)

      if (response && response.history && response.history.prices) {
        const prices = response.history.prices
        const tickData = prices.map((price: number, index: number) => {
          const priceStr = String(price)
          const decimalPart = priceStr.split(".")[1] || "00"
          const digit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")

          return {
            digit,
            timestamp: Date.now() - (prices.length - index) * 1000,
            price,
          }
        })

        setTicks(tickData)
        setPriceHistory(prices)
        setCurrentTick(tickData[tickData.length - 1])
        setTickCount(prices.length)
        setLastTickTime(new Date())

        subscribeToPriceUpdates()
        startSignalAnalysis()
      }
    } catch (error) {
      console.error("Error fetching initial data:", error)
      generateOfflineData()
    } finally {
      setIsLoading(false)
    }
  }

  const subscribeToPriceUpdates = async () => {
    try {
      console.log("🔔 Subscribing to live updates for:", volatilitySymbol)

      await derivAPI.subscribeTicks(volatilitySymbol, (response) => {
        if (response.tick && response.tick.quote) {
          const price = Number.parseFloat(response.tick.quote)
          const priceStr = String(price)
          const decimalPart = priceStr.split(".")[1] || "00"
          const digit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")

          const newTick: TickData = {
            digit,
            timestamp: Date.now(),
            price,
          }

          setCurrentTick(newTick)
          setLastTickTime(new Date())
          setTickCount((prev) => prev + 1)

          setTicks((prev) => [...prev.slice(-199), newTick])
          setPriceHistory((prev) => [...prev.slice(-199), price])
        }
      })
    } catch (error) {
      console.error("Error subscribing to ticks:", error)
      generateOfflineData()
    }
  }

  const generateOfflineData = () => {
    console.log("🔄 Premium Signals: Generating offline data...")
    setConnectionStatus("disconnected")

    // Clear any existing intervals
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }

    // Get base price for selected volatility
    const volatilityInfo = volatilitySymbols[volatilitySymbol as keyof typeof volatilitySymbols]
    const basePrice = volatilityInfo ? volatilityInfo.baseValue : 683.31

    // Generate initial data
    const initialTicks: TickData[] = []
    const initialPrices: number[] = []
    let currentPrice = basePrice

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 2
      currentPrice += change
      const priceStr = currentPrice.toFixed(2)
      const decimalPart = priceStr.split(".")[1] || "00"
      const digit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")

      const tick: TickData = {
        digit,
        timestamp: Date.now() - (100 - i) * 1000,
        price: currentPrice,
      }

      initialTicks.push(tick)
      initialPrices.push(currentPrice)
    }

    setTicks(initialTicks)
    setPriceHistory(initialPrices)
    setCurrentTick(initialTicks[initialTicks.length - 1])
    setTickCount(100)

    // Simulate live updates
    let lastPrice = currentPrice
    tickIntervalRef.current = setInterval(() => {
      const volatilityFactor = volatilityInfo ? Number.parseInt(volatilityInfo.code) / 100 : 1
      const change = (Math.random() - 0.5) * 2 * volatilityFactor
      lastPrice += change

      const priceStr = lastPrice.toFixed(2)
      const decimalPart = priceStr.split(".")[1] || "00"
      const digit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")

      const newTick: TickData = {
        digit,
        timestamp: Date.now(),
        price: lastPrice,
      }

      setCurrentTick(newTick)
      setLastTickTime(new Date())
      setTickCount((prev) => prev + 1)

      setTicks((prev) => [...prev.slice(-199), newTick])
      setPriceHistory((prev) => [...prev.slice(-199), lastPrice])
    }, 2000)

    startSignalAnalysis()
  }

  const handleVolatilityChange = (symbol: string) => {
    console.log("🔄 Changing volatility to:", symbol)

    // Clear existing data and subscriptions
    cleanup()

    setVolatilitySymbol(symbol)
    const volatilityInfo = volatilitySymbols[symbol as keyof typeof volatilitySymbols]
    if (volatilityInfo) {
      setVolatilityName(volatilityInfo.name)
    }

    // Reset state
    setTicks([])
    setPriceHistory([])
    setCurrentTick(null)
    setMatchesSignal(null)
    setEvenOddSignal(null)
    setOverUnderSignal(null)
    setTickCount(0)

    // Fetch new data
    if (isConnected) {
      fetchInitialData()
    } else {
      generateOfflineData()
    }
  }

  const startSignalAnalysis = () => {
    if (signalAnalysisRef.current) {
      clearInterval(signalAnalysisRef.current)
    }

    signalAnalysisRef.current = setInterval(() => {
      if (ticks.length >= 20) {
        analyzeSignals()
      }
    }, 5000) // Analyze every 5 seconds
  }

  const analyzeSignals = useCallback(() => {
    const recentTicks = ticks.slice(-100)

    // Matches Strategy Analysis
    analyzeMatchesStrategy(recentTicks)

    // Even/Odd Strategy Analysis
    analyzeEvenOddStrategy(recentTicks)

    // Over/Under Strategy Analysis
    analyzeOverUnderStrategy(recentTicks)
  }, [ticks, volatilitySymbol])

  const analyzeMatchesStrategy = (recentTicks: TickData[]) => {
    const digitCounts = Array(10).fill(0)
    recentTicks.forEach((tick) => digitCounts[tick.digit]++)

    const avgCount = recentTicks.length / 10
    const underrepresented = digitCounts
      .map((count, digit) => ({ digit, deficit: avgCount - count }))
      .filter((item) => item.deficit > 2)
      .sort((a, b) => b.deficit - a.deficit)

    if (underrepresented.length > 0) {
      const bestDigit = underrepresented[0]
      const confidence = Math.min(95, 50 + bestDigit.deficit * 5)

      const newSignal: Signal = {
        id: `matches-${Date.now()}`,
        type: "matches",
        prediction: `Digit ${bestDigit.digit}`,
        confidence: Math.round(confidence),
        timestamp: Date.now(),
        status: "active",
        volatility: volatilitySymbol,
      }

      if (!matchesSignal || matchesSignal.confidence < confidence) {
        setMatchesSignal(newSignal)
        addSignalToHistory(newSignal)
        playNotificationSound()
      }
    }
  }

  const analyzeEvenOddStrategy = (recentTicks: TickData[]) => {
    const recent20 = recentTicks.slice(-20)
    const evenCount = recent20.filter((tick) => tick.digit % 2 === 0).length
    const oddCount = 20 - evenCount

    let prediction = ""
    let confidence = 0

    if (evenCount >= 14) {
      prediction = "ODD"
      confidence = 60 + (evenCount - 14) * 5
    } else if (oddCount >= 14) {
      prediction = "EVEN"
      confidence = 60 + (oddCount - 14) * 5
    }

    if (prediction && confidence >= 70) {
      const newSignal: Signal = {
        id: `even-odd-${Date.now()}`,
        type: "even-odd",
        prediction,
        confidence: Math.round(confidence),
        timestamp: Date.now(),
        status: "active",
        volatility: volatilitySymbol,
      }

      if (!evenOddSignal || evenOddSignal.confidence < confidence) {
        setEvenOddSignal(newSignal)
        addSignalToHistory(newSignal)
        playNotificationSound()
      }
    }
  }

  const analyzeOverUnderStrategy = (recentTicks: TickData[]) => {
    const recent20 = recentTicks.slice(-20)
    const overCount = recent20.filter((tick) => tick.digit > 5).length
    const underCount = recent20.filter((tick) => tick.digit < 5).length

    let prediction = ""
    let confidence = 0

    if (overCount >= 14) {
      prediction = "UNDER"
      confidence = 60 + (overCount - 14) * 5
    } else if (underCount >= 14) {
      prediction = "OVER"
      confidence = 60 + (underCount - 14) * 5
    }

    if (prediction && confidence >= 70) {
      const newSignal: Signal = {
        id: `over-under-${Date.now()}`,
        type: "over-under",
        prediction,
        confidence: Math.round(confidence),
        timestamp: Date.now(),
        status: "active",
        volatility: volatilitySymbol,
      }

      if (!overUnderSignal || overUnderSignal.confidence < confidence) {
        setOverUnderSignal(newSignal)
        addSignalToHistory(newSignal)
        playNotificationSound()
      }
    }
  }

  const addSignalToHistory = (signal: Signal) => {
    setSignals((prev) => [signal, ...prev].slice(0, 50))
  }

  const playNotificationSound = () => {
    if (soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.error("Error playing notification sound:", error)
      }
    }
  }

  const refreshData = () => {
    if (isConnected) {
      fetchInitialData()
    } else {
      generateOfflineData()
    }
  }

  const getSignalStatusColor = (signal: Signal | null) => {
    if (!signal) return "bg-muted"
    switch (signal.status) {
      case "active":
        return "bg-green-500"
      case "hit":
        return "bg-blue-500"
      case "miss":
        return "bg-red-500"
      default:
        return "bg-yellow-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500"
    if (confidence >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const handleBackToDashboard = () => {
    cleanup()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 bg-transparent"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-5 w-5 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Premium Signals
              </h1>
              <p className="text-sm text-muted-foreground">Advanced Deriv Digits Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              {connectionStatus === "connected" ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : connectionStatus === "connecting" ? (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {connectionStatus === "connected"
                  ? "Live"
                  : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Offline"}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Volatility Selection */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="font-medium">Volatility Index:</span>
              </div>
              <Select value={volatilitySymbol} onValueChange={setVolatilitySymbol}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select volatility" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(volatilitySymbols).map(([symbol, info]) => (
                    <SelectItem key={symbol} value={symbol}>
                      {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                Ticks: {tickCount} | {lastTickTime ? lastTickTime.toLocaleTimeString() : "No data"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Tick Display */}
        {currentTick && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-primary">{currentTick.digit}</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Digit</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(currentTick.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-mono text-lg">{currentTick.price.toFixed(3)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Live Price Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PriceChart symbol={volatilityName} data={priceHistory} height={300} showGrid={true} showTooltip={true} />
            </CardContent>
          </Card>

          {/* Deriv Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Deriv Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DerivChart symbol={volatilitySymbol} height={300} />
            </CardContent>
          </Card>
        </div>

        {/* Signal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Matches Strategy */}
          <Card className="border-2 border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-500" />
                Matches Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={`w-3 h-3 rounded-full ${getSignalStatusColor(matchesSignal)}`} />
              </div>
              {matchesSignal ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prediction</span>
                      <Badge variant="outline">{matchesSignal.prediction}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence</span>
                      <span className={`font-semibold ${getConfidenceColor(matchesSignal.confidence)}`}>
                        {matchesSignal.confidence}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(matchesSignal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <SignalStrengthMeter confidence={matchesSignal.confidence} />
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Analyzing patterns...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Even/Odd Strategy */}
          <Card className="border-2 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Even/Odd Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={`w-3 h-3 rounded-full ${getSignalStatusColor(evenOddSignal)}`} />
              </div>
              {evenOddSignal ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prediction</span>
                      <Badge variant="outline">{evenOddSignal.prediction}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence</span>
                      <span className={`font-semibold ${getConfidenceColor(evenOddSignal.confidence)}`}>
                        {evenOddSignal.confidence}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(evenOddSignal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <SignalStrengthMeter confidence={evenOddSignal.confidence} />
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Analyzing patterns...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Over/Under Strategy */}
          <Card className="border-2 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-purple-500" />
                Over/Under Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className={`w-3 h-3 rounded-full ${getSignalStatusColor(overUnderSignal)}`} />
              </div>
              {overUnderSignal ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Prediction</span>
                      <Badge variant="outline">{overUnderSignal.prediction}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence</span>
                      <span className={`font-semibold ${getConfidenceColor(overUnderSignal.confidence)}`}>
                        {overUnderSignal.confidence}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(overUnderSignal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <SignalStrengthMeter confidence={overUnderSignal.confidence} />
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Analyzing patterns...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Tabs */}
        <Tabs defaultValue="frequency" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="frequency">Frequency Analysis</TabsTrigger>
            <TabsTrigger value="history">Signal History</TabsTrigger>
          </TabsList>
          <TabsContent value="frequency" className="space-y-4">
            <DigitFrequencyAnalyzer ticks={ticks} />
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            <SignalHistoryChart signals={signals} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
