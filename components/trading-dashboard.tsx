"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  LineChart,
  Activity,
  DollarSign,
  Target,
  Zap,
  LogOut,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Crown,
  Wifi,
  WifiOff,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import derivAPI from "@/lib/deriv-api"
import LivePriceChart from "./live-price-chart"
import CandlestickChart from "./candlestick-chart"
import VolumeChart from "./volume-chart"
import MarketDepthChart from "./market-depth-chart"
import TradingHeatmap from "./trading-heatmap"
import { MainNav } from "./main-nav"

// Volatility symbols with enhanced data
const volatilitySymbols = {
  "1HZ100V": {
    name: "Volatility 100 (1s)",
    code: "100",
    speed: "1s",
    baseValue: 683.31,
    color: "#ef4444",
    description: "High volatility synthetic index",
  },
  "1HZ75V": {
    name: "Volatility 75 (1s)",
    code: "75",
    speed: "1s",
    baseValue: 542.18,
    color: "#f97316",
    description: "Medium-high volatility synthetic index",
  },
  "1HZ50V": {
    name: "Volatility 50 (1s)",
    code: "50",
    speed: "1s",
    baseValue: 421.56,
    color: "#eab308",
    description: "Medium volatility synthetic index",
  },
  "1HZ25V": {
    name: "Volatility 25 (1s)",
    code: "25",
    speed: "1s",
    baseValue: 312.74,
    color: "#22c55e",
    description: "Low-medium volatility synthetic index",
  },
  "1HZ10V": {
    name: "Volatility 10 (1s)",
    code: "10",
    speed: "1s",
    baseValue: 156.92,
    color: "#3b82f6",
    description: "Low volatility synthetic index",
  },
  R_100: {
    name: "Volatility 100 Index",
    code: "100",
    speed: "1s",
    baseValue: 683.31,
    color: "#8b5cf6",
    description: "Standard volatility 100 index",
  },
  R_75: {
    name: "Volatility 75 Index",
    code: "75",
    speed: "1s",
    baseValue: 542.18,
    color: "#ec4899",
    description: "Standard volatility 75 index",
  },
  R_50: {
    name: "Volatility 50 Index",
    code: "50",
    speed: "1s",
    baseValue: 421.56,
    color: "#06b6d4",
    description: "Standard volatility 50 index",
  },
}

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high24h: number
  low24h: number
  lastUpdate: Date
}

interface TradingSignal {
  id: string
  type: "BUY" | "SELL" | "HOLD"
  symbol: string
  price: number
  confidence: number
  timestamp: Date
  status: "active" | "executed" | "expired"
}

export default function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("1HZ100V")
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [currentPrice, setCurrentPrice] = useState<number>(683.31)
  const [priceChange, setPriceChange] = useState<number>(0)
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0)
  const [volume, setVolume] = useState<number>(0)
  const [high24h, setHigh24h] = useState<number>(0)
  const [low24h, setLow24h] = useState<number>(0)
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [candlestickData, setCandlestickData] = useState<any[]>([])
  const [volumeData, setVolumeData] = useState<number[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("overview")

  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize component
  useEffect(() => {
    setMounted(true)
    initializeConnection()
    generateInitialData()

    return () => {
      cleanup()
    }
  }, [])

  // Handle symbol change
  useEffect(() => {
    if (mounted) {
      handleSymbolChange()
    }
  }, [selectedSymbol, mounted])

  const cleanup = () => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
    }
    derivAPI.unsubscribeTicks(selectedSymbol)
  }

  const initializeConnection = () => {
    setConnectionStatus("connecting")

    derivAPI.onOpen(() => {
      console.log("✅ Connected to Deriv API")
      setIsConnected(true)
      setConnectionStatus("connected")
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      subscribeToLiveData()
    })

    derivAPI.onClose(() => {
      console.log("❌ Disconnected from Deriv API")
      setIsConnected(false)
      setConnectionStatus("disconnected")
      startOfflineMode()
    })

    derivAPI.onError((error) => {
      console.error("🔥 Deriv API Error:", error)
      setConnectionStatus("disconnected")
      startOfflineMode()
    })

    // Fallback to offline mode after 10 seconds
    connectionTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        console.log("⏰ Connection timeout - switching to offline mode")
        startOfflineMode()
      }
    }, 10000)
  }

  const subscribeToLiveData = async () => {
    try {
      await derivAPI.subscribeTicks(selectedSymbol, (response) => {
        if (response.tick && response.tick.quote) {
          const newPrice = Number(response.tick.quote)
          updatePriceData(newPrice)
        }
      })
    } catch (error) {
      console.error("❌ Error subscribing to ticks:", error)
      startOfflineMode()
    }
  }

  const startOfflineMode = () => {
    console.log("🔄 Starting offline simulation mode")
    setConnectionStatus("disconnected")

    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }

    const symbolInfo = volatilitySymbols[selectedSymbol as keyof typeof volatilitySymbols]
    let currentPrice = symbolInfo ? symbolInfo.baseValue : 683.31

    tickIntervalRef.current = setInterval(() => {
      if (isPlaying) {
        const volatility = 0.02 // 2% volatility
        const change = (Math.random() - 0.5) * 2 * volatility * currentPrice
        currentPrice = Math.max(currentPrice + change, currentPrice * 0.5)
        updatePriceData(currentPrice)
      }
    }, 1000)
  }

  const updatePriceData = (newPrice: number) => {
    const previousPrice = currentPrice
    const change = newPrice - previousPrice
    const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0

    setCurrentPrice(newPrice)
    setPriceChange(change)
    setPriceChangePercent(changePercent)
    setLastUpdate(new Date())

    // Update price history
    setPriceHistory((prev) => {
      const updated = [...prev, newPrice]
      return updated.slice(-100) // Keep last 100 prices
    })

    // Update volume (simulated)
    const newVolume = Math.floor(Math.random() * 1000) + 500
    setVolume(newVolume)
    setVolumeData((prev) => {
      const updated = [...prev, newVolume]
      return updated.slice(-50)
    })

    // Update 24h high/low
    setHigh24h((prev) => Math.max(prev, newPrice))
    setLow24h((prev) => (prev === 0 ? newPrice : Math.min(prev, newPrice)))

    // Generate trading signals occasionally
    if (Math.random() < 0.1) {
      // 10% chance
      generateTradingSignal(newPrice)
    }

    // Play sound for significant price changes
    if (soundEnabled && Math.abs(changePercent) > 0.5) {
      playNotificationSound()
    }
  }

  const generateInitialData = () => {
    const symbolInfo = volatilitySymbols[selectedSymbol as keyof typeof volatilitySymbols]
    const basePrice = symbolInfo ? symbolInfo.baseValue : 683.31

    // Generate initial price history
    const initialPrices = []
    let price = basePrice

    for (let i = 0; i < 50; i++) {
      const change = (Math.random() - 0.5) * 0.02 * price
      price = Math.max(price + change, price * 0.8)
      initialPrices.push(price)
    }

    setPriceHistory(initialPrices)
    setCurrentPrice(price)
    setHigh24h(Math.max(...initialPrices))
    setLow24h(Math.min(...initialPrices))

    // Generate market data for all symbols
    const markets: MarketData[] = Object.entries(volatilitySymbols).map(([symbol, info]) => ({
      symbol,
      price: info.baseValue + (Math.random() - 0.5) * 20,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000) + 1000,
      high24h: info.baseValue * 1.1,
      low24h: info.baseValue * 0.9,
      lastUpdate: new Date(),
    }))

    setMarketData(markets)
  }

  const generateTradingSignal = (price: number) => {
    const types: ("BUY" | "SELL" | "HOLD")[] = ["BUY", "SELL", "HOLD"]
    const type = types[Math.floor(Math.random() * types.length)]

    const signal: TradingSignal = {
      id: `signal_${Date.now()}`,
      type,
      symbol: selectedSymbol,
      price,
      confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
      timestamp: new Date(),
      status: "active",
    }

    setTradingSignals((prev) => [signal, ...prev.slice(0, 9)]) // Keep last 10 signals
  }

  const handleSymbolChange = () => {
    cleanup()

    // Reset data
    setPriceHistory([])
    setVolumeData([])
    setHigh24h(0)
    setLow24h(0)

    // Generate new initial data
    generateInitialData()

    // Reconnect if online
    if (isConnected) {
      subscribeToLiveData()
    } else {
      startOfflineMode()
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification.mp3")
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors
      })
    } catch (error) {
      // Ignore audio errors
    }
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  const refreshData = () => {
    cleanup()
    initializeConnection()
    generateInitialData()
  }

  const handleLogout = () => {
    cleanup()
    logout()
    router.push("/login")
  }

  if (!mounted) return null

  const isDark = theme === "dark"
  const symbolInfo = volatilitySymbols[selectedSymbol as keyof typeof volatilitySymbols]

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-md",
          isDark ? "bg-gray-900/80 border-gray-800" : "bg-white/80 border-gray-200",
        )}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <MainNav />

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 font-medium">Live</span>
                  </>
                ) : connectionStatus === "connecting" ? (
                  <>
                    <div className="h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-yellow-500 font-medium">Connecting</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">Offline</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Controls */}
              <Button variant="ghost" size="sm" onClick={togglePlayPause} className="h-8 w-8 p-0">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={toggleSound} className="h-8 w-8 p-0">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <Button variant="ghost" size="sm" onClick={refreshData} className="h-8 w-8 p-0">
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/premium-signals")}
                className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400"
              >
                <Crown className="h-4 w-4" />
                Premium
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Symbol Selection & Current Price */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Symbol Selector */}
          <Card
            className={cn(
              "transition-all duration-300",
              isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(volatilitySymbols).map(([symbol, info]) => (
                    <SelectItem key={symbol} value={symbol}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: info.color }} />
                        {info.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {symbolInfo && <div className="mt-3 text-sm text-gray-500">{symbolInfo.description}</div>}
            </CardContent>
          </Card>

          {/* Current Price */}
          <Card
            className={cn(
              "transition-all duration-300",
              isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{currentPrice.toFixed(2)}</div>
                <div className="flex items-center gap-2">
                  {priceChange >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={cn("font-medium", priceChange >= 0 ? "text-green-500" : "text-red-500")}>
                    {priceChange >= 0 ? "+" : ""}
                    {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="text-xs text-gray-500">Last update: {lastUpdate.toLocaleTimeString()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          <Card
            className={cn(
              "transition-all duration-300",
              isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                24H Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">High:</span>
                  <span className="font-medium">{high24h.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Low:</span>
                  <span className="font-medium">{low24h.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Volume:</span>
                  <span className="font-medium">{volume.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Charts Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Price Chart */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Live Price Movement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LivePriceChart data={priceHistory} symbol={selectedSymbol} height={300} />
                </CardContent>
              </Card>

              {/* Volume Chart */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Volume Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VolumeChart data={volumeData} height={300} />
                </CardContent>
              </Card>
            </div>

            {/* Trading Heatmap */}
            <Card
              className={cn(
                "transition-all duration-300",
                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Market Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TradingHeatmap marketData={marketData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Candlestick Chart */}
              <Card
                className={cn(
                  "xl:col-span-2 transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Candlestick Chart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CandlestickChart symbol={selectedSymbol} height={400} />
                </CardContent>
              </Card>

              {/* Market Depth */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Market Depth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketDepthChart height={300} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Technical Indicators */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Technical Indicators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">RSI (14)</span>
                    <Badge variant="outline">65.4</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">MACD</span>
                    <Badge variant="outline" className="text-green-500">
                      Bullish
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bollinger Bands</span>
                    <Badge variant="outline">Middle</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moving Average</span>
                    <Badge variant="outline" className="text-blue-500">
                      Above
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Market Sentiment */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Market Sentiment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">72%</div>
                    <div className="text-sm text-gray-500">Bullish Sentiment</div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "72%" }}></div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Metrics */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="text-lg">Risk Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Volatility</span>
                    <Badge variant="outline" className="text-orange-500">
                      High
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Beta</span>
                    <Badge variant="outline">1.24</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sharpe Ratio</span>
                    <Badge variant="outline">0.85</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Max Drawdown</span>
                    <Badge variant="outline" className="text-red-500">
                      -12.5%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Signals */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Active Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tradingSignals.slice(0, 5).map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              signal.type === "BUY" ? "default" : signal.type === "SELL" ? "destructive" : "secondary"
                            }
                          >
                            {signal.type}
                          </Badge>
                          <div>
                            <div className="font-medium">{signal.symbol}</div>
                            <div className="text-sm text-gray-500">{signal.price.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{signal.confidence}%</div>
                          <div className="text-xs text-gray-500">{signal.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Signal Performance */}
              <Card
                className={cn(
                  "transition-all duration-300",
                  isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Signal Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-medium text-green-500">78.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Signals</span>
                      <span className="font-medium">247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg Confidence</span>
                      <span className="font-medium">82.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Best Streak</span>
                      <span className="font-medium text-green-500">12 wins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Markets Tab */}
          <TabsContent value="markets" className="space-y-6">
            <Card
              className={cn(
                "transition-all duration-300",
                isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  All Markets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketData.map((market) => (
                    <div
                      key={market.symbol}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        selectedSymbol === market.symbol ? "ring-2 ring-blue-500" : "",
                      )}
                      onClick={() => setSelectedSymbol(market.symbol)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              volatilitySymbols[market.symbol as keyof typeof volatilitySymbols]?.color || "#6b7280",
                          }}
                        />
                        <div>
                          <div className="font-medium">
                            {volatilitySymbols[market.symbol as keyof typeof volatilitySymbols]?.name || market.symbol}
                          </div>
                          <div className="text-sm text-gray-500">Vol: {market.volume.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{market.price.toFixed(2)}</div>
                        <div
                          className={cn(
                            "text-sm flex items-center gap-1",
                            market.changePercent >= 0 ? "text-green-500" : "text-red-500",
                          )}
                        >
                          {market.changePercent >= 0 ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          {market.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
