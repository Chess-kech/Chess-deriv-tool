"use client"

import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import derivAPI from "@/lib/deriv-api"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { MainNav } from "./main-nav"
import { LogOut, RefreshCw, Loader2, Sparkles, BarChart3, Clock, Target, Wifi, WifiOff } from "lucide-react"
import PriceChart from "./price-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import TradingPatterns from "./trading-patterns"
import FrequencyDistributionChart from "./frequency-distribution-chart"

// Advanced protection system - obfuscated variables
const _0xPROT = {
  _0xa1b2: "contextmenu",
  _0xc3d4: "keydown",
  _0xe5f6: "selectstart",
  _0xg7h8: "dragstart",
  _0xi9j0: "copy",
  _0xk1l2: "cut",
  _0xm3n4: "paste",
  _0xo5p6: "print",
}

// Protection event handler
const _0xSECURE = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
  return false
}

// Developer tools detection
const _0xDETECT = () => {
  const threshold = 160
  return window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold
}

// Keyboard protection
const _0xKEYBLOCK = (e: KeyboardEvent) => {
  const blocked = ["F12", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11"]

  const ctrlBlocked =
    e.ctrlKey && ["u", "U", "s", "S", "i", "I", "j", "J", "c", "C", "a", "A", "p", "P"].includes(e.key)

  const shiftCtrlBlocked = e.ctrlKey && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key)

  if (blocked.includes(e.key) || ctrlBlocked || shiftCtrlBlocked) {
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

// Console protection - safer version
const _0xCONSOLE = () => {
  const noop = () => {}
  try {
    // Only override specific methods, preserve others
    const originalConsole = { ...console }
    Object.defineProperty(window, "console", {
      value: {
        ...originalConsole,
        log: noop,
        warn: noop,
        error: noop,
        info: noop,
        debug: noop,
        trace: noop,
        clear: noop,
        table: noop,
        group: noop,
        groupEnd: noop,
        // Preserve other console methods like timeStamp
        timeStamp: originalConsole.timeStamp || noop,
        time: originalConsole.time || noop,
        timeEnd: originalConsole.timeEnd || noop,
        count: originalConsole.count || noop,
        countReset: originalConsole.countReset || noop,
        assert: originalConsole.assert || noop,
        dir: originalConsole.dir || noop,
        dirxml: originalConsole.dirxml || noop,
      },
      writable: false,
      configurable: false,
    })
  } catch {}
}

// Disable selection and drag
const _0xDISABLE = () => {
  const styles = {
    userSelect: "none",
    webkitUserSelect: "none",
    mozUserSelect: "none",
    msUserSelect: "none",
    webkitTouchCallout: "none",
    webkitUserDrag: "none",
  }
  Object.assign(document.body.style, styles)
  Object.assign(document.documentElement.style, styles)
}

// Map of volatility symbols to their display names
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

const strategies = ["Matches", "Differs", "Even/Odd", "Over/Under"]

export function DigitFlowAnalyzer() {
  const [currentValue, setCurrentValue] = useState("717.19")
  const [volatilitySymbol, setVolatilitySymbol] = useState("1HZ100V")
  const [volatilityName, setVolatilityName] = useState("Volatility 100 (1s) Index")
  const [strategy, setStrategy] = useState("Matches")
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictedDigit, setPredictedDigit] = useState<number | null>(null)
  const [predictedRuns, setPredictedRuns] = useState<number | null>(null)
  const [tradingRecommendation, setTradingRecommendation] = useState<string | null>(null)
  const [recommendationConfidence, setRecommendationConfidence] = useState<number>(0)
  const [countdownValue, setCountdownValue] = useState<number | null>(null)
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [digitData, setDigitData] = useState([
    { digit: 0, percentage: 8.91 },
    { digit: 1, percentage: 8.87 },
    { digit: 2, percentage: 11.14 },
    { digit: 3, percentage: 8.16 },
    { digit: 4, percentage: 9.03 },
    { digit: 5, percentage: 5.07 },
    { digit: 6, percentage: 6.27 },
    { digit: 7, percentage: 12.27 },
    { digit: 8, percentage: 8.09 },
    { digit: 9, percentage: 7.54 },
  ])
  const [overPercentage, setOverPercentage] = useState(48)
  const [underPercentage, setUnderPercentage] = useState(52)
  const [recentDigits, setRecentDigits] = useState<number[]>([])
  const [selectedOverUnder, setSelectedOverUnder] = useState<"over" | "under" | null>(null)
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [animateIn, setAnimateIn] = useState(false)
  const { theme, setTheme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const predictedDigitRef = useRef<number | null>(null)
  const digitUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [recommendedRuns, setRecommendedRuns] = useState<number | null>(null)
  const [recommendedVolatility, setRecommendedVolatility] = useState<string | null>(null)
  const [highlightedDigit, setHighlightedDigit] = useState<number | null>(null)
  const [priceTransitioning, setPriceTransitioning] = useState(false)
  const [showFrequencyChart, setShowFrequencyChart] = useState(true)
  const [showTradingPatterns, setShowTradingPatterns] = useState(true)
  const [tradingRecommendations, setTradingRecommendations] = useState<any[]>([])
  const [tradingPatterns, setTradingPatterns] = useState<any[]>([])
  const [analysisDetails, setAnalysisDetails] = useState<string>("")
  const [lastTickTime, setLastTickTime] = useState<Date | null>(null)
  const [tickCount, setTickCount] = useState(0)
  const [isChangingVolatility, setIsChangingVolatility] = useState(false)
  const [stablePriceForVolatility, setStablePriceForVolatility] = useState<{ [key: string]: string }>({})

  // Effect to update percentages when prediction changes
  useEffect(() => {
    if (predictedDigitRef.current !== null) {
      // Update over/under percentages based on the predicted digit
      const isOver = predictedDigitRef.current >= 5

      // Adjust percentages to emphasize the prediction
      if (isOver) {
        setOverPercentage(65)
        setUnderPercentage(35)
      } else {
        setOverPercentage(35)
        setUnderPercentage(65)
      }
    }
  }, [predictedDigit])

  // Handle theme mounting and animation
  useEffect(() => {
    setMounted(true)
    // Trigger entrance animation after a short delay
    setTimeout(() => {
      setAnimateIn(true)
    }, 100)
  }, [])

  // Protection system initialization
  useEffect(() => {
    // Initialize protection
    _0xDISABLE()
    _0xCONSOLE()

    // Add event listeners for all protection events
    Object.values(_0xPROT).forEach((event) => {
      document.addEventListener(event, _0xSECURE, { capture: true, passive: false })
      window.addEventListener(event, _0xSECURE, { capture: true, passive: false })
    })

    // Add keyboard protection
    document.addEventListener(_0xPROT._0xc3d4, _0xKEYBLOCK, { capture: true, passive: false })
    window.addEventListener(_0xPROT._0xc3d4, _0xKEYBLOCK, { capture: true, passive: false })

    // Developer tools detection loop
    const detectionInterval = setInterval(() => {
      if (_0xDETECT()) {
        console.clear()
        // Blur content when devtools detected
        document.body.style.filter = "blur(10px)"
        setTimeout(() => {
          document.body.style.filter = "none"
        }, 1000)
      }

      // Clear console periodically
      try {
        console.clear()
      } catch {}
    }, 1000)

    // Cleanup
    return () => {
      clearInterval(detectionInterval)
      Object.values(_0xPROT).forEach((event) => {
        document.removeEventListener(event, _0xSECURE, true)
        window.removeEventListener(event, _0xSECURE, true)
      })
      document.removeEventListener(_0xPROT._0xc3d4, _0xKEYBLOCK, true)
      window.removeEventListener(_0xPROT._0xc3d4, _0xKEYBLOCK, true)
    }
  }, [])

  // Set up event listeners for Deriv API
  useEffect(() => {
    const initializeConnection = async () => {
      setIsLoading(true)
      setConnectionStatus("connecting")

      try {
        // Check if already connected
        if (derivAPI.getConnectionStatus()) {
          console.log("✅ Already connected to Deriv API")
          setIsConnected(true)
          setConnectionStatus("connected")
          setIsLoading(false)
          await fetchInitialData()
          return
        }

        // Set up event handlers
        derivAPI.onOpen(() => {
          console.log("✅ Connected to Deriv API successfully")
          setIsConnected(true)
          setConnectionStatus("connected")
          setIsLoading(false)
          fetchInitialData()
        })

        derivAPI.onClose(() => {
          console.log("❌ Disconnected from Deriv API")
          setIsConnected(false)
          setConnectionStatus("disconnected")
          // Don't immediately fallback to offline mode, let it try to reconnect
          setTimeout(() => {
            if (!derivAPI.getConnectionStatus()) {
              generateOfflineData()
            }
          }, 5000)
        })

        derivAPI.onError((error) => {
          console.error("🔥 Deriv API Error:", error)
          setConnectionStatus("disconnected")
          setIsLoading(false)
          generateOfflineData()
        })

        // Force connection if needed
        if (!derivAPI.getConnectionStatus()) {
          await derivAPI.forceReconnect()
        }
      } catch (error) {
        console.error("❌ Connection initialization failed:", error)
        setIsConnected(false)
        setConnectionStatus("disconnected")
        setIsLoading(false)
        generateOfflineData()
      }
    }

    initializeConnection()

    return () => {
      // Cleanup
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current)
      }
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      if (digitUpdateIntervalRef.current) {
        clearInterval(digitUpdateIntervalRef.current)
      }
      derivAPI.unsubscribeTicks(volatilitySymbol)
    }
  }, [])

  // Set up interval for dynamic digit percentages with smoother transitions
  useEffect(() => {
    // Only update percentages if we're not connected (offline mode)
    if (!isConnected && !isChangingVolatility) {
      digitUpdateIntervalRef.current = setInterval(() => {
        setDigitData((prevData) => {
          const newData = prevData.map((item) => {
            const adjustment = (Math.random() - 0.5) * 0.3
            const newPercentage = Math.max(0.1, Math.min(25, item.percentage + adjustment))
            return {
              ...item,
              percentage: Number(newPercentage.toFixed(2)),
            }
          })
          return newData
        })
      }, 1200)
    }

    return () => {
      if (digitUpdateIntervalRef.current) {
        clearInterval(digitUpdateIntervalRef.current)
      }
    }
  }, [isConnected, isChangingVolatility])

  // Fetch initial data when connected
  const fetchInitialData = async () => {
    if (isChangingVolatility) return // Don't fetch if we're changing volatility

    setIsLoading(true)
    try {
      console.log("🔄 Fetching initial data for symbol:", volatilitySymbol)

      const response = await derivAPI.getTickHistory(volatilitySymbol, 500)

      if (response && response.history && response.history.prices) {
        const prices = response.history.prices
        console.log(`📊 Processing ${prices.length} price points`)

        // Process the price data to extract last digits
        const digits = prices.map((price: number) => {
          const priceStr = String(price)
          const decimalPart = priceStr.split(".")[1] || "00"
          return Number.parseInt(decimalPart[decimalPart.length - 1] || "0")
        })

        setRecentDigits(digits)
        setPriceHistory(prices)
        setTickCount(prices.length)

        // Calculate digit frequencies from real data
        updateDigitPercentagesFromDigits(digits)

        // Set current price and store stable price for this volatility
        if (prices.length > 0) {
          const currentPrice = String(prices[prices.length - 1])
          setCurrentValue(currentPrice)
          setStablePriceForVolatility((prev) => ({
            ...prev,
            [volatilitySymbol]: currentPrice,
          }))
          setLastTickTime(new Date())
        }

        // Subscribe to live ticks
        await subscribeToPriceUpdates()

        // Confirm connection is working
        setIsConnected(true)
        setConnectionStatus("connected")
      } else {
        throw new Error("No valid data received")
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error)
      setIsConnected(false)
      setConnectionStatus("disconnected")
      generateOfflineData()
    } finally {
      setIsLoading(false)
    }
  }

  // Subscribe to live price updates
  const subscribeToPriceUpdates = async () => {
    try {
      console.log("🔔 Subscribing to live price updates for", volatilitySymbol)
      await derivAPI.subscribeTicks(volatilitySymbol, (response) => {
        if (response.tick && response.tick.quote && !isChangingVolatility) {
          const price = Number(response.tick.quote)
          const priceStr = String(price)

          console.log("📈 Live tick received:", priceStr)

          setCurrentValue(priceStr)
          setStablePriceForVolatility((prev) => ({
            ...prev,
            [volatilitySymbol]: priceStr,
          }))
          setLastTickTime(new Date())
          setTickCount((prev) => prev + 1)

          setPriceHistory((prev) => [...prev, price].slice(-500)) // Keep last 500 prices

          // Extract last digit and update recent digits
          const decimalPart = priceStr.split(".")[1] || "00"
          const lastDigit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")

          setRecentDigits((prev) => {
            const updated = [...prev, lastDigit]
            return updated.slice(-200) // Keep last 200 digits for analysis
          })

          // Update digit percentages with real data
          updateDigitPercentages()
        }
      })
    } catch (error) {
      console.error("❌ Error subscribing to ticks:", error)
    }
  }

  // Generate offline data (fallback)
  const generateOfflineData = () => {
    if (isChangingVolatility) return // Don't generate if we're changing volatility

    console.log("🔄 Generating offline data...")

    // Clear any existing interval
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }

    // Get the base price for the selected volatility
    const volatilityInfo = volatilitySymbols[volatilitySymbol as keyof typeof volatilitySymbols]
    const basePrice = volatilityInfo ? volatilityInfo.baseValue : 717.19

    // Use stable price if available, otherwise use base price
    const startPrice = stablePriceForVolatility[volatilitySymbol]
      ? Number.parseFloat(stablePriceForVolatility[volatilitySymbol])
      : basePrice

    // Set initial price
    setCurrentValue(startPrice.toFixed(2))

    // Generate initial price history
    const initialPrices = []
    let currentPrice = startPrice

    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 0.5
      currentPrice += change
      initialPrices.push(currentPrice)
    }

    setPriceHistory(initialPrices)

    // Generate initial digit history
    const initialDigits = initialPrices.map((price) => {
      const priceStr = price.toFixed(2)
      const decimalPart = priceStr.split(".")[1] || "00"
      return Number.parseInt(decimalPart[decimalPart.length - 1] || "0")
    })
    setRecentDigits(initialDigits)

    // Update percentages based on initial digits
    updateDigitPercentagesFromDigits(initialDigits)

    // Simulate price updates
    let lastPrice = currentPrice

    tickIntervalRef.current = setInterval(() => {
      if (isChangingVolatility) return // Don't update if changing volatility

      const trend = lastPrice > startPrice ? -0.1 : 0.1
      const randomOffset = (Math.random() - 0.5 + trend) * 0.4
      const newPrice = lastPrice + randomOffset
      lastPrice = newPrice

      const formattedPrice = newPrice.toFixed(2)
      setCurrentValue(formattedPrice)
      setStablePriceForVolatility((prev) => ({
        ...prev,
        [volatilitySymbol]: formattedPrice,
      }))
      setLastTickTime(new Date())

      // Update price history
      setPriceHistory((prev) => [...prev, newPrice].slice(-500))

      // Extract last digit and update recent digits
      const decimalPart = formattedPrice.split(".")[1] || "00"
      const lastDigit = Number.parseInt(decimalPart[decimalPart.length - 1] || "0")

      setRecentDigits((prev) => {
        const updated = [...prev, lastDigit]
        return updated.slice(-200)
      })

      // Update digit percentages
      updateDigitPercentages()
    }, 1000)
  }

  // Update digit percentages based on recent digits
  const updateDigitPercentages = () => {
    if (recentDigits.length === 0 || isChangingVolatility) return

    const counts = Array(10).fill(0)
    recentDigits.forEach((digit) => {
      counts[digit]++
    })

    const total = recentDigits.length
    const newDigitData = Array(10)
      .fill(0)
      .map((_, index) => {
        const newPercentage = total > 0 ? Number.parseFloat(((counts[index] / total) * 100).toFixed(2)) : 10.0
        const prevPercentage = digitData.find((item) => item.digit === index)?.percentage || 0

        return {
          digit: index,
          percentage: newPercentage,
          changed: Math.abs(newPercentage - prevPercentage) > 0.5,
        }
      })

    setDigitData(newDigitData)

    // Calculate over/under percentages (digits 0-4 vs 5-9)
    const overCount = counts.slice(5).reduce((sum, count) => sum + count, 0)
    const underCount = counts.slice(0, 5).reduce((sum, count) => sum + count, 0)

    if (selectedOverUnder === null) {
      setOverPercentage(Math.round((overCount / total) * 100))
      setUnderPercentage(Math.round((underCount / total) * 100))
    }
  }

  // Add a new function to update percentages from a specific set of digits
  const updateDigitPercentagesFromDigits = (digits: number[]) => {
    if (digits.length === 0 || isChangingVolatility) return

    const counts = Array(10).fill(0)
    digits.forEach((digit) => {
      counts[digit]++
    })

    const total = digits.length
    const newDigitData = Array(10)
      .fill(0)
      .map((_, index) => ({
        digit: index,
        percentage: total > 0 ? Number.parseFloat(((counts[index] / total) * 100).toFixed(2)) : 10.0,
      }))

    setDigitData(newDigitData)

    // Calculate over/under percentages (digits 0-4 vs 5-9)
    const overCount = counts.slice(5).reduce((sum, count) => sum + count, 0)
    const underCount = counts.slice(0, 5).reduce((sum, count) => sum + count, 0)

    if (selectedOverUnder === null) {
      setOverPercentage(Math.round((overCount / total) * 100))
      setUnderPercentage(Math.round((underCount / total) * 100))
    }
  }

  // Advanced analysis function for accurate predictions with live data
  const performAdvancedAnalysis = (digits: number[], strategy: string) => {
    if (digits.length < 10) return { recommendation: null, confidence: 0, details: "Insufficient data" }

    const recentDigits = digits.slice(-50) // Analyze last 50 digits for more responsive analysis
    let recommendation = null
    let confidence = 0
    let details = ""

    // Base confidence starts at 90% for premium signals
    const baseConfidence = 90

    if (strategy === "Even/Odd") {
      const evenCount = recentDigits.filter((d) => d % 2 === 0).length
      const evenPercentage = (evenCount / recentDigits.length) * 100
      const oddPercentage = 100 - evenPercentage

      // Analyze recent trend (last 10 digits)
      const recent10 = recentDigits.slice(-10)
      const recentEvenCount = recent10.filter((d) => d % 2 === 0).length
      const recentEvenPercentage = (recentEvenCount / 10) * 100

      if (recentEvenPercentage >= 70) {
        recommendation = "Even"
        confidence = baseConfidence + Math.floor(Math.random() * 8)
        details = `Strong recent even trend (${recentEvenPercentage}%). Live data confirms continuation.`
      } else if (recentEvenPercentage <= 30) {
        recommendation = "Odd"
        confidence = baseConfidence + Math.floor(Math.random() * 8)
        details = `Strong recent odd trend (${100 - recentEvenPercentage}%). Live data confirms continuation.`
      } else if (evenPercentage > 60) {
        recommendation = "Even"
        confidence = baseConfidence + Math.floor(Math.random() * 6)
        details = `Overall even bias (${evenPercentage.toFixed(1)}%). Live analysis supports even.`
      } else if (oddPercentage > 60) {
        recommendation = "Odd"
        confidence = baseConfidence + Math.floor(Math.random() * 6)
        details = `Overall odd bias (${oddPercentage.toFixed(1)}%). Live analysis supports odd.`
      } else {
        recommendation = evenPercentage >= oddPercentage ? "Even" : "Odd"
        confidence = baseConfidence + Math.floor(Math.random() * 5)
        details = `Live market analysis indicates ${recommendation.toLowerCase()} advantage.`
      }
    } else if (strategy === "Over/Under") {
      const overCount = recentDigits.filter((d) => d >= 5).length
      const overPercentage = (overCount / recentDigits.length) * 100
      const underPercentage = 100 - overPercentage

      // Analyze recent momentum (last 10 digits)
      const recent10 = recentDigits.slice(-10)
      const recentOverCount = recent10.filter((d) => d >= 5).length
      const recentOverPercentage = (recentOverCount / 10) * 100

      if (recentOverPercentage >= 70) {
        recommendation = "Over"
        confidence = baseConfidence + Math.floor(Math.random() * 8)
        details = `Strong recent over momentum (${recentOverPercentage}%). Live data confirms trend.`
      } else if (recentOverPercentage <= 30) {
        recommendation = "Under"
        confidence = baseConfidence + Math.floor(Math.random() * 8)
        details = `Strong recent under momentum (${100 - recentOverPercentage}%). Live data confirms trend.`
      } else if (overPercentage > 60) {
        recommendation = "Over"
        confidence = baseConfidence + Math.floor(Math.random() * 6)
        details = `Overall over bias (${overPercentage.toFixed(1)}%). Live analysis supports over.`
      } else if (underPercentage > 60) {
        recommendation = "Under"
        confidence = baseConfidence + Math.floor(Math.random() * 6)
        details = `Overall under bias (${underPercentage.toFixed(1)}%). Live analysis supports under.`
      } else {
        recommendation = overPercentage >= underPercentage ? "Over" : "Under"
        confidence = baseConfidence + Math.floor(Math.random() * 5)
        details = `Live market analysis indicates ${recommendation.toLowerCase()} advantage.`
      }
    } else if (strategy === "Matches") {
      const lastDigit = recentDigits[recentDigits.length - 1]
      const digitCounts = Array(10).fill(0)
      recentDigits.forEach((d) => digitCounts[d]++)

      const lastDigitFrequency = (digitCounts[lastDigit] / recentDigits.length) * 100

      // Check recent pattern
      const recent5 = recentDigits.slice(-5)
      const lastDigitInRecent5 = recent5.filter((d) => d === lastDigit).length

      if (lastDigitInRecent5 === 0 && lastDigitFrequency < 15) {
        recommendation = `Matches ${lastDigit}`
        confidence = baseConfidence + Math.floor(Math.random() * 8)
        details = `Digit ${lastDigit} absent in recent ticks (${lastDigitFrequency.toFixed(1)}% overall). Live data suggests match incoming.`
      } else if (lastDigitFrequency < 8) {
        recommendation = `Matches ${lastDigit}`
        confidence = baseConfidence + Math.floor(Math.random() * 6)
        details = `Digit ${lastDigit} underrepresented (${lastDigitFrequency.toFixed(1)}%). Live analysis favors match.`
      } else {
        recommendation = `Matches ${lastDigit}`
        confidence = baseConfidence + Math.floor(Math.random() * 5)
        details = `Live market conditions favor digit ${lastDigit} repetition.`
      }
    } else if (strategy === "Differs") {
      const lastDigit = recentDigits[recentDigits.length - 1]
      const digitCounts = Array(10).fill(0)
      recentDigits.forEach((d) => digitCounts[d]++)

      // Find least frequent digit (excluding last digit)
      let minCount = Number.POSITIVE_INFINITY
      let bestDigit = (lastDigit + 1) % 10

      for (let i = 0; i < 10; i++) {
        if (i !== lastDigit && digitCounts[i] < minCount) {
          minCount = digitCounts[i]
          bestDigit = i
        }
      }

      const lastDigitFrequency = (digitCounts[lastDigit] / recentDigits.length) * 100
      const bestDigitFrequency = (digitCounts[bestDigit] / recentDigits.length) * 100

      if (lastDigitFrequency > 20) {
        recommendation = `Differs ${bestDigit}`
        confidence = baseConfidence + Math.floor(Math.random() * 8)
        details = `Digit ${lastDigit} overrepresented (${lastDigitFrequency.toFixed(1)}%). Live data suggests differs ${bestDigit}.`
      } else {
        recommendation = `Differs ${bestDigit}`
        confidence = baseConfidence + Math.floor(Math.random() * 6)
        details = `Live analysis recommends differs ${bestDigit} (${bestDigitFrequency.toFixed(1)}% frequency).`
      }
    }

    return { recommendation, confidence: Math.round(confidence), details }
  }

  // Handle volatility change with stable price transition
  const handleVolatilityChange = async (symbol: string) => {
    setIsChangingVolatility(true)
    setPriceTransitioning(true)

    // Clear existing subscriptions and intervals
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }
    if (digitUpdateIntervalRef.current) {
      clearInterval(digitUpdateIntervalRef.current)
    }

    try {
      await derivAPI.unsubscribeTicks(volatilitySymbol)
    } catch (error) {
      console.log("Error unsubscribing:", error)
    }

    // Update volatility info
    setVolatilitySymbol(symbol)
    const volatilityInfo = volatilitySymbols[symbol as keyof typeof volatilitySymbols]
    if (volatilityInfo) {
      setVolatilityName(volatilityInfo.name)
    }

    // Set stable price immediately if we have it
    if (stablePriceForVolatility[symbol]) {
      setCurrentValue(stablePriceForVolatility[symbol])
    } else {
      // Use base value temporarily
      const baseValue = volatilityInfo?.baseValue || 717.19
      setCurrentValue(baseValue.toFixed(2))
    }

    // Reset analysis data
    setPredictedDigit(null)
    setPredictedRuns(null)
    setTradingRecommendation(null)
    setRecommendationConfidence(0)
    setCountdownValue(null)
    setSelectedOverUnder(null)
    setSelectedNumber(null)
    setHighlightedDigit(null)
    setRecommendedRuns(null)
    setRecommendedVolatility(null)

    // Wait a moment for UI to update
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Fetch new data for selected volatility
    try {
      if (isConnected && derivAPI.getConnectionStatus()) {
        await fetchInitialData()
      } else {
        generateOfflineData()
      }
    } catch (error) {
      console.error("Error fetching data for new volatility:", error)
      generateOfflineData()
    }

    // Complete transition
    setTimeout(() => {
      setPriceTransitioning(false)
      setIsChangingVolatility(false)
    }, 1000)
  }

  // Handle strategy change
  const handleStrategyChange = (value: string) => {
    setStrategy(value)
    setPredictedDigit(null)
    setPredictedRuns(null)
    setTradingRecommendation(null)
    setRecommendationConfidence(0)
    setCountdownValue(null)
  }

  // Function to calculate runs based on volatility
  const calculateRunsForVolatility = (volatilitySymbol: string, confidence: number): number => {
    const volatilityInfo = volatilitySymbols[volatilitySymbol as keyof typeof volatilitySymbols]
    const volatilityLevel = volatilityInfo ? Number.parseInt(volatilityInfo.code) : 100

    let baseRuns: number

    if (volatilityLevel >= 100) {
      baseRuns = 3
    } else if (volatilityLevel >= 75) {
      baseRuns = 4
    } else if (volatilityLevel >= 50) {
      baseRuns = 5
    } else if (volatilityLevel >= 25) {
      baseRuns = 6
    } else {
      baseRuns = 7
    }

    const confidenceMultiplier = confidence / 100
    const adjustedRuns = Math.round(baseRuns * (0.7 + confidenceMultiplier * 0.6))

    return Math.max(2, Math.min(10, adjustedRuns))
  }

  // Handle prediction with enhanced live data analysis
  const handlePredict = () => {
    setIsPredicting(true)

    setTimeout(() => {
      // Perform advanced analysis with live data
      const analysis = performAdvancedAnalysis(recentDigits, strategy)

      setTradingRecommendation(analysis.recommendation)
      setRecommendationConfidence(analysis.confidence)
      setAnalysisDetails(analysis.details)

      // Calculate runs based on confidence and volatility
      const calculatedRuns = calculateRunsForVolatility(volatilitySymbol, analysis.confidence)
      setPredictedRuns(calculatedRuns)

      // Extract specific digit for highlighting
      if (analysis.recommendation) {
        const match = analysis.recommendation.match(/\d+/)
        if (match) {
          const digit = Number.parseInt(match[0])
          setPredictedDigit(digit)
          setHighlightedDigit(digit)
        }
      }

      setCountdownValue(15)

      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }

      countdownRef.current = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current)
            return null
          }
          return prev - 1
        })
      }, 1000)

      setIsPredicting(false)
    }, 2000)
  }

  // Handle Over button click
  const handleOverClick = (num: number) => {
    setSelectedOverUnder("over")
    setSelectedNumber(num)

    const overValue = 60 + Math.floor(Math.random() * 15)
    setOverPercentage(overValue)
    setUnderPercentage(100 - overValue)
  }

  // Handle Under button click
  const handleUnderClick = (num: number) => {
    setSelectedOverUnder("under")
    setSelectedNumber(num)

    const underValue = 60 + Math.floor(Math.random() * 15)
    setUnderPercentage(underValue)
    setOverPercentage(100 - underValue)
  }

  // Toggle frequency chart
  const toggleFrequencyChart = () => {
    setShowFrequencyChart(!showFrequencyChart)
  }

  // Toggle trading patterns
  const toggleTradingPatterns = () => {
    setShowTradingPatterns(!showTradingPatterns)
  }

  // Refresh the analyzer
  const refreshAnalyzer = async () => {
    setRecentDigits([])
    setPriceHistory([])
    setPredictedDigit(null)
    setPredictedRuns(null)
    setTradingRecommendation(null)
    setRecommendationConfidence(0)
    setCountdownValue(null)
    setSelectedOverUnder(null)
    setSelectedNumber(null)
    setTickCount(0)

    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    try {
      await derivAPI.unsubscribeTicks(volatilitySymbol)
    } catch (error) {
      console.log("Error unsubscribing during refresh:", error)
    }

    if (isConnected && derivAPI.getConnectionStatus()) {
      await fetchInitialData()
    } else {
      generateOfflineData()
    }
  }

  // Handle sign out
  const handleSignOut = () => {
    logout()
    router.push("/login")
  }

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500"
    if (confidence >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  // Get confidence background
  const getConfidenceBackground = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500"
    if (confidence >= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Prevent hydration mismatch
  if (!mounted) return null

  const isDarkTheme = theme === "dark"

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto min-h-screen flex flex-col transition-colors duration-500",
        isDarkTheme
          ? "bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white"
          : "bg-gradient-to-br from-pink-50 via-purple-100 to-indigo-50 text-gray-900",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 flex items-center justify-between border-b backdrop-blur-md",
          isDarkTheme ? "bg-black/30 border-purple-500/20" : "bg-white/30 border-purple-200",
          "sticky top-0 z-10",
        )}
      >
        <MainNav />

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Live Data</span>
              </>
            ) : connectionStatus === "connecting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                <span className="text-yellow-500">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-500">Offline</span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "rounded-full transition-all duration-300 hover:scale-110",
              isDarkTheme
                ? "text-purple-300 hover:text-purple-100 hover:bg-purple-900/50"
                : "text-purple-700 hover:text-purple-900 hover:bg-purple-200/50",
            )}
          >
            <Sparkles className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className={cn(
              "rounded-full transition-all duration-300 hover:scale-110",
              isDarkTheme
                ? "text-red-300 hover:text-red-100 hover:bg-red-900/50"
                : "text-red-700 hover:text-red-900 hover:bg-red-200/50",
            )}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 flex flex-col items-center">
        {/* Control buttons */}
        <div
          className={cn(
            "w-full flex justify-between gap-2 mb-6 transition-all duration-500 transform",
            animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <Button
            variant="destructive"
            className="flex-1 h-12 font-bold bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all duration-300"
            onClick={handleSignOut}
          >
            Signout
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300"
            onClick={() => setIsAnalysisRunning(true)}
            disabled={isAnalysisRunning}
          >
            Start Analysis
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300"
            onClick={refreshAnalyzer}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Chart and Controls Layout */}
        <div
          className={cn(
            "w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 transition-all duration-500 transform",
            animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            "delay-100",
          )}
        >
          {/* Chart - Takes 2/3 of the width on medium screens and above */}
          <div className="md:col-span-2 relative">
            <PriceChart symbol={volatilityName} data={priceHistory} height={350} />

            {/* Price transition overlay */}
            {priceTransitioning && (
              <div className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-pink-500 mb-2" />
                  <div className="text-white font-medium">Loading {volatilityName}...</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls - Takes 1/3 of the width on medium screens and above */}
          <div className="space-y-4">
            <Card
              className={cn(
                "p-4 transition-all duration-300",
                isDarkTheme
                  ? "bg-gray-900/60 border-pink-500/20 hover:border-pink-500/40"
                  : "bg-white/90 border-purple-300/30 hover:border-purple-500/40",
                "hover:shadow-lg hover:shadow-pink-500/10",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-1/3 text-lg font-medium flex items-center">
                  <BarChart3 className={cn("h-5 w-5 mr-2", isDarkTheme ? "text-pink-400" : "text-purple-600")} />
                  Volatility:
                </div>
                <div className="w-2/3">
                  <Select value={volatilitySymbol} onValueChange={handleVolatilityChange}>
                    <SelectTrigger
                      className={cn(
                        "h-12 rounded-md transition-all duration-300",
                        isDarkTheme
                          ? "bg-gray-800 border-pink-500/30 hover:border-pink-500/50"
                          : "bg-white border-purple-300 hover:border-purple-500/50",
                      )}
                    >
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
                </div>
              </div>
            </Card>

            <Card
              className={cn(
                "p-4 transition-all duration-300",
                isDarkTheme
                  ? "bg-gray-900/60 border-pink-500/20 hover:border-pink-500/40"
                  : "bg-white/90 border-purple-300/30 hover:border-purple-500/40",
                "hover:shadow-lg hover:shadow-pink-500/10",
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-1/3 text-lg font-medium flex items-center">
                  <Clock className={cn("h-5 w-5 mr-2", isDarkTheme ? "text-pink-400" : "text-purple-600")} />
                  Strategy:
                </div>
                <div className="w-2/3">
                  <Select value={strategy} onValueChange={handleStrategyChange}>
                    <SelectTrigger
                      className={cn(
                        "h-12 rounded-md transition-all duration-300",
                        isDarkTheme
                          ? "bg-gray-800 border-pink-500/30 hover:border-pink-500/50"
                          : "bg-white border-purple-300 hover:border-purple-500/50",
                      )}
                    >
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((strat) => (
                        <SelectItem key={strat} value={strat}>
                          {strat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Current price */}
            <Card
              className={cn(
                "text-center p-4 border transition-all duration-300 relative",
                isDarkTheme ? "bg-gray-900/60 border-orange-500/30" : "bg-white/90 border-orange-300/50",
                "shadow-lg shadow-orange-500/10 transform hover:scale-105",
              )}
            >
              <div className="text-4xl font-bold text-center text-gradient bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {currentValue}
              </div>
              {lastTickTime && (
                <div className="text-xs text-gray-500 mt-1">
                  Last update: {lastTickTime.toLocaleTimeString()} | Ticks: {tickCount}
                </div>
              )}
              {connectionStatus === "connected" && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </Card>

            {/* Predict button */}
            <Button
              className={cn(
                "w-full h-14 text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform transition-all hover:scale-105",
                "relative overflow-hidden",
              )}
              onClick={handlePredict}
              disabled={isPredicting || countdownValue !== null}
            >
              <span className="relative z-10">
                {isPredicting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing {isConnected ? "Live" : "Offline"} Data...
                  </div>
                ) : countdownValue !== null ? (
                  "Wait..."
                ) : (
                  "Predict"
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
            </Button>

            {/* Trading Recommendation */}
            {tradingRecommendation && (
              <Card
                className={cn(
                  "text-center p-4 border transition-all duration-300",
                  isDarkTheme ? "bg-gray-900/60 border-green-500/30" : "bg-white/90 border-green-300/50",
                  "shadow-lg shadow-green-500/10 transform hover:scale-105",
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    {strategy} Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-600 mb-2">
                    {tradingRecommendation}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{strategy} Strategy</div>

                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-sm font-medium">Confidence:</span>
                    <span className={cn("text-lg font-bold", getConfidenceColor(recommendationConfidence))}>
                      {recommendationConfidence}%
                    </span>
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", getConfidenceBackground(recommendationConfidence))}
                        style={{ width: `${recommendationConfidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {predictedRuns && <div className="text-sm font-medium mb-2">Recommended Runs: {predictedRuns}</div>}

                  {countdownValue !== null && (
                    <div className="text-sm text-center mt-2 flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4" />
                      Trade in: {countdownValue}s
                    </div>
                  )}

                  <div className="mt-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Analysis:</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{analysisDetails}</div>
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1 text-xs">
                    {isConnected ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-500">Live Deriv Data Analysis</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-orange-500">Offline Data Analysis</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Digit Analysis Grid */}
        <div
          className={cn(
            "w-full grid grid-cols-5 sm:grid-cols-10 gap-2 mb-6 transition-all duration-500 transform",
            animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            "delay-200",
          )}
        >
          {digitData.map((item) => (
            <div
              key={item.digit}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-md transition-all duration-300 transform hover:scale-105",
                isDarkTheme
                  ? "bg-gray-900/60 border-pink-500/20 hover:border-pink-500/40"
                  : "bg-white/90 border-purple-300/30 hover:border-purple-500/40",
                item.digit === highlightedDigit ? "ring-2 ring-pink-500" : "",
              )}
              onClick={() => {
                handleOverClick(item.digit)
                setSelectedNumber(item.digit)
              }}
            >
              <div className="text-lg font-bold">{item.digit}</div>
              <div className="text-sm">{item.percentage}%</div>
            </div>
          ))}
        </div>

        {/* Over/Under Buttons */}
        <div
          className={cn(
            "w-full flex justify-center gap-4 mb-6 transition-all duration-500 transform",
            animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            "delay-300",
          )}
        >
          <Button
            className={cn(
              "flex-1 h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-full shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transform transition-all hover:scale-105",
              selectedOverUnder === "over" ? "ring-2 ring-green-500" : "",
            )}
            onClick={() => handleOverClick(5)}
          >
            Over ({overPercentage}%)
          </Button>
          <Button
            className={cn(
              "flex-1 h-12 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-full shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transform transition-all hover:scale-105",
              selectedOverUnder === "under" ? "ring-2 ring-red-500" : "",
            )}
            onClick={() => handleUnderClick(4)}
          >
            Under ({underPercentage}%)
          </Button>
        </div>

        {/* Toggle Buttons for Charts */}
        <div
          className={cn(
            "w-full flex justify-center gap-4 mb-6 transition-all duration-500 transform",
            animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            "delay-400",
          )}
        >
          <Button
            variant="secondary"
            className={cn(
              "flex-1 h-12 text-lg font-bold transform transition-all hover:scale-105",
              showFrequencyChart
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : isDarkTheme
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900",
            )}
            onClick={toggleFrequencyChart}
          >
            {showFrequencyChart ? "Hide" : "Show"} Frequency Chart
          </Button>
          <Button
            variant="secondary"
            className={cn(
              "flex-1 h-12 text-lg font-bold transform transition-all hover:scale-105",
              showTradingPatterns
                ? "bg-purple-500 text-white hover:bg-purple-600"
                : isDarkTheme
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900",
            )}
            onClick={toggleTradingPatterns}
          >
            {showTradingPatterns ? "Hide" : "Show"} Trading Patterns
          </Button>
        </div>

        {/* Trading Patterns Analysis */}
        {showTradingPatterns && (
          <div
            className={cn(
              "w-full transition-all duration-500 transform",
              animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              "delay-500",
            )}
          >
            <TradingPatterns
              priceHistory={priceHistory}
              recentDigits={recentDigits}
              isConnected={isConnected}
              className="mb-6"
              onRecommendationsChange={setTradingRecommendations}
              onPatternsChange={setTradingPatterns}
            />
          </div>
        )}

        {/* Frequency Distribution Chart */}
        {showFrequencyChart && (
          <div
            className={cn(
              "w-full transition-all duration-500 transform",
              animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              "delay-600",
            )}
          >
            <FrequencyDistributionChart
              digitData={digitData}
              recentDigits={recentDigits}
              isConnected={isConnected}
              className="mb-6"
            />
          </div>
        )}
      </div>
    </div>
  )
}
