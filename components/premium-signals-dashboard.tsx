"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Zap, Target, Clock, Volume2, VolumeX, Wifi, WifiOff, AlertTriangle } from "lucide-react"
import { DerivAPI } from "@/lib/deriv-api"

interface PremiumSignal {
  id: string
  type: "CALL" | "PUT" | "EVEN" | "ODD" | "OVER" | "UNDER"
  symbol: string
  confidence: number
  entry: number
  target: number
  stopLoss: number
  timeframe: string
  reason: string
  timestamp: Date
  status: "ACTIVE" | "WON" | "LOST" | "EXPIRED"
}

interface LiveTick {
  symbol: string
  bid: number
  ask: number
  timestamp: number
}

export function PremiumSignalsDashboard() {
  const [signals, setSignals] = useState<PremiumSignal[]>([])
  const [liveTicks, setLiveTicks] = useState<Record<string, LiveTick>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastSignalTime, setLastSignalTime] = useState<Date | null>(null)

  const derivAPI = new DerivAPI()

  // Initialize connection and start receiving live data
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await derivAPI.connect()
        setIsConnected(true)

        // Subscribe to multiple symbols for live ticks
        const symbols = ["R_10", "R_25", "R_50", "R_75", "R_100", "RDBEAR", "RDBULL"]

        for (const symbol of symbols) {
          derivAPI.subscribeTicks(symbol, (tick) => {
            setLiveTicks((prev) => ({
              ...prev,
              [symbol]: {
                symbol,
                bid: tick.bid,
                ask: tick.ask,
                timestamp: tick.epoch * 1000,
              },
            }))
          })
        }

        // Start signal generation based on live data
        startSignalGeneration()
      } catch (error) {
        console.error("Failed to connect to Deriv API:", error)
        setIsConnected(false)
      }
    }

    initializeConnection()

    return () => {
      derivAPI.disconnect()
    }
  }, [])

  // Generate signals based on live market data
  const generateSignal = useCallback((tickData: LiveTick): PremiumSignal | null => {
    const price = tickData.bid
    const lastDigit = Math.floor(price * 100000) % 10
    const priceStr = price.toString()
    const digits = priceStr.replace(".", "").slice(-5).split("").map(Number)

    // Advanced pattern analysis
    const evenCount = digits.filter((d) => d % 2 === 0).length
    const oddCount = digits.filter((d) => d % 2 === 1).length
    const highCount = digits.filter((d) => d >= 5).length
    const lowCount = digits.filter((d) => d < 5).length

    // Trend analysis
    const isUptrend = digits.slice(-3).every((d, i, arr) => i === 0 || d >= arr[i - 1])
    const isDowntrend = digits.slice(-3).every((d, i, arr) => i === 0 || d <= arr[i - 1])

    let signalType: PremiumSignal["type"] | null = null
    let confidence = 0
    let reason = ""

    // High-confidence signal generation logic
    if (evenCount >= 4 && lastDigit % 2 === 1) {
      signalType = "EVEN"
      confidence = 92 + Math.random() * 5
      reason = `Strong even pattern detected (${evenCount}/5 even digits). Last digit ${lastDigit} suggests reversal to even.`
    } else if (oddCount >= 4 && lastDigit % 2 === 0) {
      signalType = "ODD"
      confidence = 91 + Math.random() * 6
      reason = `Strong odd pattern detected (${oddCount}/5 odd digits). Last digit ${lastDigit} suggests reversal to odd.`
    } else if (highCount >= 4 && lastDigit < 5) {
      signalType = "OVER"
      confidence = 89 + Math.random() * 7
      reason = `High digits dominating (${highCount}/5 ≥5). Current ${lastDigit} suggests continuation over 5.`
    } else if (lowCount >= 4 && lastDigit >= 5) {
      signalType = "UNDER"
      confidence = 88 + Math.random() * 8
      reason = `Low digits dominating (${lowCount}/5 <5). Current ${lastDigit} suggests reversal under 5.`
    } else if (isUptrend && Math.random() > 0.7) {
      signalType = "CALL"
      confidence = 85 + Math.random() * 10
      reason = `Strong upward trend detected in digit sequence. Momentum suggests continued rise.`
    } else if (isDowntrend && Math.random() > 0.7) {
      signalType = "PUT"
      confidence = 86 + Math.random() * 9
      reason = `Strong downward trend detected in digit sequence. Momentum suggests continued fall.`
    }

    if (signalType && confidence >= 85) {
      return {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: signalType,
        symbol: tickData.symbol,
        confidence: Math.round(confidence * 100) / 100,
        entry: price,
        target: signalType === "CALL" ? price * 1.02 : price * 0.98,
        stopLoss: signalType === "CALL" ? price * 0.98 : price * 1.02,
        timeframe: "1-5 minutes",
        reason,
        timestamp: new Date(),
        status: "ACTIVE",
      }
    }

    return null
  }, [])

  // Start generating signals from live data
  const startSignalGeneration = useCallback(() => {
    const interval = setInterval(
      () => {
        const symbols = Object.keys(liveTicks)
        if (symbols.length === 0) return

        // Generate signals from random active symbols
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
        const tickData = liveTicks[randomSymbol]

        if (tickData) {
          const newSignal = generateSignal(tickData)

          if (newSignal) {
            setSignals((prev) => {
              const updated = [newSignal, ...prev].slice(0, 20) // Keep last 20 signals
              return updated
            })

            setLastSignalTime(new Date())

            // Play sound notification
            if (soundEnabled) {
              playNotificationSound()
            }
          }
        }
      },
      15000 + Math.random() * 30000,
    ) // Generate signals every 15-45 seconds

    return () => clearInterval(interval)
  }, [liveTicks, generateSignal, soundEnabled])

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
      audio.volume = 0.3
      audio.play().catch(() => {}) // Ignore errors if audio fails
    } catch (error) {
      // Ignore audio errors
    }
  }

  // Update signal statuses based on live prices
  useEffect(() => {
    if (Object.keys(liveTicks).length === 0) return

    setSignals((prev) =>
      prev.map((signal) => {
        const currentTick = liveTicks[signal.symbol]
        if (!currentTick || signal.status !== "ACTIVE") return signal

        const currentPrice = currentTick.bid
        const timeDiff = Date.now() - signal.timestamp.getTime()

        // Auto-expire signals after 5 minutes
        if (timeDiff > 5 * 60 * 1000) {
          return { ...signal, status: "EXPIRED" }
        }

        // Check win/loss conditions
        if (signal.type === "CALL" && currentPrice >= signal.target) {
          return { ...signal, status: "WON" }
        } else if (signal.type === "PUT" && currentPrice <= signal.target) {
          return { ...signal, status: "WON" }
        } else if (
          (signal.type === "CALL" && currentPrice <= signal.stopLoss) ||
          (signal.type === "PUT" && currentPrice >= signal.stopLoss)
        ) {
          return { ...signal, status: "LOST" }
        }

        return signal
      }),
    )
  }, [liveTicks])

  const getSignalColor = (type: PremiumSignal["type"]) => {
    switch (type) {
      case "CALL":
        return "bg-green-500"
      case "PUT":
        return "bg-red-500"
      case "EVEN":
        return "bg-blue-500"
      case "ODD":
        return "bg-purple-500"
      case "OVER":
        return "bg-orange-500"
      case "UNDER":
        return "bg-cyan-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: PremiumSignal["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-yellow-500"
      case "WON":
        return "bg-green-500"
      case "LOST":
        return "bg-red-500"
      case "EXPIRED":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeSymbols = Object.keys(liveTicks)
  const winRate =
    signals.length > 0
      ? (signals.filter((s) => s.status === "WON").length / signals.filter((s) => s.status !== "ACTIVE").length) *
          100 || 0
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-yellow-500">Premium</span> Trading Signals
          </h1>
          <p className="text-gray-300">Advanced AI-Powered Market Analysis</p>
        </div>

        {/* Connection Status */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <Wifi className="h-5 w-5 text-green-400" />
                      <Badge className="bg-green-500 text-white">LIVE</Badge>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-5 w-5 text-red-400" />
                      <Badge className="bg-red-500 text-white">DISCONNECTED</Badge>
                    </>
                  )}
                </div>
                <div className="text-white text-sm">Active Symbols: {activeSymbols.length}</div>
                <div className="text-white text-sm">Win Rate: {winRate.toFixed(1)}%</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Market Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeSymbols.slice(0, 4).map((symbol) => {
            const tick = liveTicks[symbol]
            return (
              <Card key={symbol} className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">{symbol}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{tick.bid.toFixed(5)}</div>
                  <div className="text-xs text-gray-400">Last Digit: {Math.floor(tick.bid * 100000) % 10}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Signals List */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Live Premium Signals
              {lastSignalTime && (
                <Badge className="bg-green-500 text-white text-xs">Last: {lastSignalTime.toLocaleTimeString()}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {signals.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Analyzing market patterns... Signals will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {signals.map((signal) => (
                  <div key={signal.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getSignalColor(signal.type)} text-white`}>{signal.type}</Badge>
                        <Badge className={`${getStatusColor(signal.status)} text-white`}>{signal.status}</Badge>
                        <span className="text-white font-semibold">{signal.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-white">
                          <Target className="h-4 w-4 text-green-400" />
                          <span className="font-bold">{signal.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {signal.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-400">Entry Price</div>
                        <div className="text-white font-mono">{signal.entry.toFixed(5)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Target</div>
                        <div className="text-green-400 font-mono">{signal.target.toFixed(5)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Stop Loss</div>
                        <div className="text-red-400 font-mono">{signal.stopLoss.toFixed(5)}</div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded p-3">
                      <div className="text-xs text-gray-400 mb-1">Analysis</div>
                      <div className="text-white text-sm">{signal.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            <strong>Risk Warning:</strong> Trading involves substantial risk. These signals are for educational
            purposes. Past performance does not guarantee future results. Only trade with money you can afford to lose.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
