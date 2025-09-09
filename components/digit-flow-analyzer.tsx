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
  "1HZ100V": { name: "Volatility 100 (1s) Index", code: "100", speed: "1s", baseValue: 683.31 },
  "1HZ75V": { name: "Volatility 75 (1s) Index", code: "75", speed: "1s", baseValue: 542.18 },
  "1HZ50V": { name: "Volatility 50 (1s) Index", code: "50", speed: "1s", baseValue: 421.56 },
  "1HZ25V": { name: "Volatility 25 (1s) Index", code: "25", speed: "1s", baseValue: 312.74 },
  "1HZ10V": { name: "Volatility 10 (1s) Index", code: "10", speed: "1s", baseValue: 156.92 },
}

const strategies = ["Matches", "Differs", "Even", "Odd", "Over", "Under"]

export function DigitFlowAnalyzer() {
  const [currentValue, setCurrentValue] = useState("717.19")
  const [volatilitySymbol, setVolatilitySymbol] = useState("1HZ100V")
  const [volatilityName, setVolatilityName] = useState("Volatility 100 (1s) Index")
  const [strategy, setStrategy] = useState("Matches/Differs")
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
  const connectOrGenerateOfflineRef = useRef<(value: boolean) => void>(() => {})
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
    const connectOrGenerateOffline = (initial = false) => {
      if (!isConnected || initial) {
        setIsLoading(true)
        setConnectionStatus("connecting")
        connectionTimeoutRef.current = setTimeout(() => {
          if (!isConnected) {
            console.log("Connection timeout - using offline mode")
            generateOfflineData()
            setIsLoading(false)
            setConnectionStatus("disconnected")
          }
        }, 10000) // Increased timeout to 10 seconds
      } else {
        setIsLoading(false)
      }
    }

    connectOrGenerateOfflineRef.current = connectOrGenerateOffline

    derivAPI.onOpen(() => {
      console.log("✅ Connected to Deriv API successfully")
      setIsConnected(true)
      setConnectionStatus("connected")
      setIsLoading(false)
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }
      fetchInitialData()
    })

    derivAPI.onClose(() => {
      console.log("❌ Disconnected from Deriv API")
      setIsConnected(false)
      setConnectionStatus("disconnected")
      connectOrGenerateOfflineRef.current(false)
    })

    derivAPI.onError((error) => {
      console.error("🔥 Deriv API Error:", error)
      setConnectionStatus("disconnected")
    })

    connectOrGenerateOfflineRef.current(true)

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
  }, [volatilitySymbol, isConnected])

  // Set up interval for dynamic digit percentages with smoother transitions
  useEffect(() => {
    // Only update percentages if we're not connected (offline mode)
    if (!isConnected) {
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
  }, [isConnected])

  // Fetch initial data when connected
  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      console.log("🔄 Fetching initial data for symbol:", volatilitySymbol)

      // Add a retry mechanism
      let attempts = 0
      const maxAttempts = 3
      let response

      while (attempts < maxAttempts) {
        try {
          console.log(`📡 Fetch attempt ${attempts + 1} of ${maxAttempts}...`)
          response = await derivAPI.getTickHistory(volatilitySymbol, 1000) // Increased to 1000 ticks

          if (response && !response.error) {
            console.log("✅ Successfully fetched tick history")
            break
          }

          if (response && response.error) {
            console.error("❌ API error on attempt", attempts + 1, ":", response.error)
            await new Promise((resolve) => setTimeout(resolve, 2000))
          }
        } catch (error) {
          console.error("❌ Error on attempt", attempts + 1, ":", error)
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        attempts++
      }

      if (!response || response.error) {
        console.error("❌ Failed to fetch data after all attempts, switching to offline mode")
        generateOfflineData()
        return
      }

      if (response.history && response.history.prices) {
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

        // Set current price
        if (prices.length > 0) {
          setCurrentValue(String(prices[prices.length - 1]))
          setLastTickTime(new Date())
        }

        // Subscribe to live ticks
        subscribeToPriceUpdates()
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error)
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
        if (response.tick && response.tick.quote) {
          const price = Number(response.tick.quote)
          const priceStr = String(price)

          console.log("📈 Live tick received:", priceStr)

          setCurrentValue(priceStr)
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
    console.log("🔄 Generating offline data...")

    // Clear any existing interval
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }

    // Get the base price for the selected volatility
    const volatilityInfo = volatilitySymbols[volatilitySymbol as keyof typeof volatilitySymbols]
    const basePrice = volatilityInfo ? volatilityInfo.baseValue : 717.19

    // Set initial price
    setCurrentValue(basePrice.toFixed(2))

    // Generate initial price history
    const initialPrices = []
    let currentPrice = basePrice

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
      const trend = lastPrice > basePrice ? -0.1 : 0.1
      const randomOffset = (Math.random() - 0.5 + trend) * 0.4
      const newPrice = lastPrice + randomOffset
      lastPrice = newPrice

      const formattedPrice = newPrice.toFixed(2)
      setCurrentValue(formattedPrice)
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
    if (recentDigits.length === 0) return

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
    if (digits.length === 0) return

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

  // Advanced analysis function for accurate predictions
  const performAdvancedAnalysis = (digits: number[], strategy: string) => {
    if (digits.length < 20) return { recommendation: null, confidence: 0, details: "Insufficient data" }

    const recentDigits = digits.slice(-100) // Analyze last 100 digits
    let recommendation = null
    let confidence = 0
    let details = ""

    if (strategy === "Even") {
      // Even strategy analysis
      const evenCount = recentDigits.filter((d) => d % 2 === 0).length
      const evenPercentage = (evenCount / recentDigits.length) * 100

      // Analyze streaks
      let currentStreak = 1
      const lastDigitIsEven = recentDigits[recentDigits.length - 1] % 2 === 0

      for (let i = recentDigits.length - 2; i >= 0; i--) {
        const digitIsEven = recentDigits[i] % 2 === 0
        if (digitIsEven === lastDigitIsEven) {
          currentStreak++
        } else {
          break
        }
      }

      // Decision logic for Even
      if (evenPercentage > 60) {
        recommendation = "Even"
        confidence = Math.min((evenPercentage - 50) * 2, 90)
        details = `Strong even bias (${evenPercentage.toFixed(1)}%). Continue with Even.`
      } else if (evenPercentage < 40) {
        recommendation = "Even"
        confidence = Math.min((50 - evenPercentage) * 2.5, 85)
        details = `Even digits underrepresented (${evenPercentage.toFixed(1)}%). Correction expected.`
      } else if (currentStreak >= 4 && !lastDigitIsEven) {
        recommendation = "Even"
        confidence = Math.min(currentStreak * 15, 80)
        details = `Long odd streak (${currentStreak}). Even reversal expected.`
      } else {
        recommendation = "Even"
        confidence = 55 + Math.abs(evenPercentage - 50)
        details = `Moderate even trend (${evenPercentage.toFixed(1)}% even frequency).`
      }
    } else if (strategy === "Odd") {
      // Odd strategy analysis
      const evenCount = recentDigits.filter((d) => d % 2 === 0).length
      const oddPercentage = ((recentDigits.length - evenCount) / recentDigits.length) * 100

      // Analyze streaks
      let currentStreak = 1
      const lastDigitIsOdd = recentDigits[recentDigits.length - 1] % 2 === 1

      for (let i = recentDigits.length - 2; i >= 0; i--) {
        const digitIsOdd = recentDigits[i] % 2 === 1
        if (digitIsOdd === lastDigitIsOdd) {
          currentStreak++
        } else {
          break
        }
      }

      // Decision logic for Odd
      if (oddPercentage > 60) {
        recommendation = "Odd"
        confidence = Math.min((oddPercentage - 50) * 2, 90)
        details = `Strong odd bias (${oddPercentage.toFixed(1)}%). Continue with Odd.`
      } else if (oddPercentage < 40) {
        recommendation = "Odd"
        confidence = Math.min((50 - oddPercentage) * 2.5, 85)
        details = `Odd digits underrepresented (${oddPercentage.toFixed(1)}%). Correction expected.`
      } else if (currentStreak >= 4 && !lastDigitIsOdd) {
        recommendation = "Odd"
        confidence = Math.min(currentStreak * 15, 80)
        details = `Long even streak (${currentStreak}). Odd reversal expected.`
      } else {
        recommendation = "Odd"
        confidence = 55 + Math.abs(oddPercentage - 50)
        details = `Moderate odd trend (${oddPercentage.toFixed(1)}% odd frequency).`
      }
    } else if (strategy === "Over") {
      // Over strategy analysis (digits 5-9)
      const overCount = recentDigits.filter((d) => d >= 5).length
      const overPercentage = (overCount / recentDigits.length) * 100

      // Analyze recent momentum
      const recent20 = recentDigits.slice(-20)
      const recentOverCount = recent20.filter((d) => d >= 5).length
      const momentum = (recentOverCount / 20) * 100

      // Decision logic for Over
      if (overPercentage > 60) {
        recommendation = "Over"
        confidence = Math.min((overPercentage - 50) * 2, 90)
        details = `Strong over bias (${overPercentage.toFixed(1)}%). Continue with Over.`
      } else if (overPercentage < 40) {
        recommendation = "Over"
        confidence = Math.min((50 - overPercentage) * 2.5, 85)
        details = `Over digits underrepresented (${overPercentage.toFixed(1)}%). Correction expected.`
      } else if (momentum > 70) {
        recommendation = "Over"
        confidence = Math.min(momentum + 10, 90)
        details = `Strong recent over momentum (${momentum.toFixed(1)}%). Continue trend.`
      } else {
        recommendation = "Over"
        confidence = 55 + Math.abs(overPercentage - 50)
        details = `Moderate over trend (${overPercentage.toFixed(1)}% over frequency).`
      }
    } else if (strategy === "Under") {
      // Under strategy analysis (digits 0-4)
      const underCount = recentDigits.filter((d) => d < 5).length
      const underPercentage = (underCount / recentDigits.length) * 100

      // Analyze recent momentum
      const recent20 = recentDigits.slice(-20)
      const recentUnderCount = recent20.filter((d) => d < 5).length
      const momentum = (recentUnderCount / 20) * 100

      // Decision logic for Under
      if (underPercentage > 60) {
        recommendation = "Under"
        confidence = Math.min((underPercentage - 50) * 2, 90)
        details = `Strong under bias (${underPercentage.toFixed(1)}%). Continue with Under.`
      } else if (underPercentage < 40) {
        recommendation = "Under"
        confidence = Math.min((50 - underPercentage) * 2.5, 85)
        details = `Under digits underrepresented (${underPercentage.toFixed(1)}%). Correction expected.`
      } else if (momentum > 70) {
        recommendation = "Under"
        confidence = Math.min(momentum + 10, 90)
        details = `Strong recent under momentum (${momentum.toFixed(1)}%). Continue trend.`
      } else {
        recommendation = "Under"
        confidence = 55 + Math.abs(underPercentage - 50)
        details = `Moderate under trend (${underPercentage.toFixed(1)}% under frequency).`
      }
    } else if (strategy === "Matches") {
      // Matches strategy analysis
      const lastDigit = recentDigits[recentDigits.length - 1]
      const digitCounts = Array(10).fill(0)
      recentDigits.forEach((d) => digitCounts[d]++)

      // Count consecutive matches
      let consecutiveMatches = 0
      for (let i = recentDigits.length - 2; i >= 0; i--) {
        if (recentDigits[i] === lastDigit) {
          consecutiveMatches++
        } else {
          break
        }
      }

      const lastDigitFrequency = (digitCounts[lastDigit] / recentDigits.length) * 100

      // Decision logic for Matches
      if (lastDigitFrequency < 5) {
        recommendation = `Matches ${lastDigit}`
        confidence = Math.min((10 - lastDigitFrequency) * 8, 85)
        details = `Digit ${lastDigit} underrepresented (${lastDigitFrequency.toFixed(1)}%). Matches expected.`
      } else if (consecutiveMatches === 0 && lastDigitFrequency < 8) {
        recommendation = `Matches ${lastDigit}`
        confidence = 70
        details = `No recent matches for digit ${lastDigit}. Due for repetition.`
      } else {
        recommendation = `Matches ${lastDigit}`
        confidence = 55
        details = `Moderate matches opportunity for digit ${lastDigit}.`
      }
    } else if (strategy === "Differs") {
      // Differs strategy analysis
      const lastDigit = recentDigits[recentDigits.length - 1]
      const digitCounts = Array(10).fill(0)
      recentDigits.forEach((d) => digitCounts[d]++)

      // Count consecutive matches
      let consecutiveMatches = 0
      for (let i = recentDigits.length - 2; i >= 0; i--) {
        if (recentDigits[i] === lastDigit) {
          consecutiveMatches++
        } else {
          break
        }
      }

      const lastDigitFrequency = (digitCounts[lastDigit] / recentDigits.length) * 100

      // Find best differ digit (least frequent, excluding last digit)
      let minCount = Number.POSITIVE_INFINITY
      let bestDigit = (lastDigit + 1) % 10

      for (let i = 0; i < 10; i++) {
        if (i !== lastDigit && digitCounts[i] < minCount) {
          minCount = digitCounts[i]
          bestDigit = i
        }
      }

      // Decision logic for Differs
      if (consecutiveMatches >= 2) {
        recommendation = `Differs ${bestDigit}`
        confidence = Math.min(consecutiveMatches * 25 + 40, 90)
        details = `${consecutiveMatches + 1} consecutive ${lastDigit}s. Differs ${bestDigit} expected.`
      } else if (lastDigitFrequency > 15) {
        recommendation = `Differs ${bestDigit}`
        confidence = Math.min((lastDigitFrequency - 10) * 4, 85)
        details = `Digit ${lastDigit} overrepresented (${lastDigitFrequency.toFixed(1)}%). Differs ${bestDigit} expected.`
      } else {
        recommendation = `Differs ${bestDigit}`
        confidence = 60
        details = `Moderate differs opportunity. Recommend digit ${bestDigit}.`
      }
    }

    return { recommendation, confidence: Math.round(confidence), details }
  }

  // Get action text for trading
  const getActionText = (strategy: string, value: string | number): string => {
    if (strategy === "Even" || strategy === "Odd") {
      return `TRADE ${strategy.toUpperCase()}`
    } else if (strategy === "Over" || strategy === "Under") {
      return `TRADE ${strategy.toUpperCase()}`
    } else if (strategy === "Matches") {
      return `TRADE MATCHES ${value}`
    } else if (strategy === "Differs") {
      return `TRADE DIFFERS ${value}`
    }
    return `TRADE ${value}`.toUpperCase()
  }

  // Handle volatility change
  const handleVolatilityChange = (symbol: string) => {
    setPriceTransitioning(true)

    // Clear existing subscriptions first
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
    }
    derivAPI.unsubscribeTicks(volatilitySymbol)

    setVolatilitySymbol(symbol)
    const volatilityInfo = volatilitySymbols[symbol as keyof typeof volatilitySymbols]

    if (volatilityInfo) {
      setVolatilityName(volatilityInfo.name)
    }

    // Reset data
    setRecentDigits([])
    setPriceHistory([])
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
    setTickCount(0)

    // Fetch new data for selected volatility
    setTimeout(() => {
      if (isConnected) {
        fetchInitialData()
      } else {
        generateOfflineData()
      }

      setTimeout(() => {
        setPriceTransitioning(false)
      }, 500)
    }, 300)
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

  // Handle prediction with enhanced analysis
  const handlePredict = () => {
    setIsPredicting(true)

    setTimeout(() => {
      // Perform advanced analysis
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
  const refreshAnalyzer = () => {
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

    derivAPI.unsubscribeTicks(volatilitySymbol)

    if (isConnected) {
      fetchInitialData()
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
    if (confidence >= 80) return "text-green-500"
    if (confidence >= 65) return "text-yellow-500"
    return "text-red-500"
  }

  // Get confidence background
  const getConfidenceBackground = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 65) return "bg-yellow-500"
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
