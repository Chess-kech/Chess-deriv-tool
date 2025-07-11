"use client"

import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  Bell,
  DollarSign,
  HelpCircle,
  Play,
  Loader2,
  Moon,
  Sun,
  BarChart2,
  AlertCircle,
  RefreshCw,
  User,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import derivAPI from "@/lib/deriv-api"
import DerivChart from "@/components/deriv-chart"
import AccountSection from "@/components/account-section"
import TradeForm from "@/components/trade-form"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { MainNav } from "./main-nav"

// Map of volatility symbols to their display names
const volatilitySymbols = {
  "1HZ100V": { name: "Volatility 100 (1s) Index", code: "100", speed: "1s", baseValue: 683.31 },
  "1HZ75V": { name: "Volatility 75 (1s) Index", code: "75", speed: "1s", baseValue: 542.18 },
  "1HZ50V": { name: "Volatility 50 (1s) Index", code: "50", speed: "1s", baseValue: 421.56 },
  "1HZ25V": { name: "Volatility 25 (1s) Index", code: "25", speed: "1s", baseValue: 312.74 },
  "1HZ10V": { name: "Volatility 10 (1s) Index", code: "10", speed: "1s", baseValue: 156.92 },
  "2HZ100V": { name: "Volatility 100 (2s) Index", code: "100", speed: "2s", baseValue: 685.47 },
  "2HZ50V": { name: "Volatility 50 (2s) Index", code: "50", speed: "2s", baseValue: 425.33 },
  "5HZ100V": { name: "Volatility 100 (5s) Index", code: "100", speed: "5s", baseValue: 689.12 },
}

export default function DerivAnalysis() {
  const [currentValue, setCurrentValue] = useState("0.00")
  const [displayValue, setDisplayValue] = useState("0.0")
  const [lastDigit, setLastDigit] = useState("0")
  const [volatilitySymbol, setVolatilitySymbol] = useState("1HZ25V")
  const [volatilityName, setVolatilityName] = useState("Volatility 25 (1s) Index")
  const [volatilityCode, setVolatilityCode] = useState("25")
  const [volatilitySpeed, setVolatilitySpeed] = useState("1s")
  const [selectedDigit, setSelectedDigit] = useState<number | null>(5)
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictedDigit, setPredictedDigit] = useState<number | null>(null)
  const [showPrediction, setShowPrediction] = useState(false)
  const [startCountdown, setStartCountdown] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [showAccountSection, setShowAccountSection] = useState(false)
  const { theme, setTheme } = useTheme()
  const [digitData, setDigitData] = useState([
    { digit: 0, percentage: 9.6, highlight: null },
    { digit: 1, percentage: 9.0, highlight: "red" },
    { digit: 2, percentage: 10.8, highlight: null },
    { digit: 3, percentage: 10.6, highlight: null },
    { digit: 4, percentage: 10.4, highlight: null },
    { digit: 5, percentage: 9.4, highlight: null, selected: true },
    { digit: 6, percentage: 9.6, highlight: null },
    { digit: 7, percentage: 11.0, highlight: "green" },
    { digit: 8, percentage: 10.5, highlight: null },
    { digit: 9, percentage: 9.1, highlight: null },
  ])
  const [recentDigits, setRecentDigits] = useState<number[]>([])
  const [tradingType, setTradingType] = useState("matches-differs") // Options: "matches-differs", "over-under", "even-odd"
  const [digitHistory, setDigitHistory] = useState<Record<number, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [accountInfo, setAccountInfo] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const [recommendedVolatility, setRecommendedVolatility] = useState<string | undefined>()
  const [recommendedDuration, setRecommendedDuration] = useState<number | undefined>()
  const [recommendedAction, setRecommendedAction] = useState<string | undefined>()
  const [recommendedRuns, setRecommendedRuns] = useState<number | undefined>()
  const [recommendedNumber, setRecommendedNumber] = useState<number | undefined>()
  const [optimalStartTime, setOptimalStartTime] = useState<number | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const startTimerRef = useRef<NodeJS.Timeout | null>(null)
  const percentageTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { logout } = useAuth()
  const router = useRouter()

  // Helper function to update digit percentages
  const updateDigitPercentages = (digitCounts: Record<number, number>, totalDigits: number) => {
    const updatedDigitData = digitData.map((item) => {
      const count = digitCounts[item.digit] || 0
      const percentage = totalDigits > 0 ? (count / totalDigits) * 100 : 0
      return { ...item, percentage: Number.parseFloat(percentage.toFixed(1)) }
    })
    setDigitData(updatedDigitData)
  }

  // Handle theme mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Set up event listeners for Deriv API authentication
  useEffect(() => {
    derivAPI.onLogin((info) => {
      setIsLoggedIn(!!info)
      setAccountInfo(info)
    })
  }, [])

  // Update the useEffect that handles connection to Deriv API
  useEffect(() => {
    let connectionCheckInterval: NodeJS.Timeout

    const connectToDerivAPI = async () => {
      console.log("Initializing connection to Deriv API...")
      setConnectionError("Connecting to Deriv API...")
      setIsInitializing(true)

      derivAPI.onOpen(async () => {
        console.log("Connected to Deriv API successfully")
        setIsConnected(true)
        setConnectionError(null)

        try {
          console.log("Getting server time...")
          const serverTimeResponse = await derivAPI.getServerTime()
          console.log("Server time:", serverTimeResponse)

          console.log("Getting tradable assets...")
          const assets = await derivAPI.getTradableAssets()
          console.log("Available trading assets:", assets)

          console.log("Fetching initial history...")
          await fetchInitialHistory()
        } catch (error) {
          console.error("Error getting API data:", error)
          setConnectionError("Connected but failed to retrieve data.")
          generateOfflineData()
        } finally {
          setIsInitializing(false)
        }
      })

      derivAPI.onClose(() => {
        console.log("Disconnected from Deriv API")
        setIsConnected(false)
        setConnectionError("Connection to Deriv API lost.")

        if (!isInitializing) {
          generateOfflineData()
        }
      })

      derivAPI.onError((error) => {
        console.error("Connection error:", error)
        setConnectionError("Connection error.")

        if (!isInitializing) {
          generateOfflineData()
        }
      })
    }

    connectToDerivAPI()

    connectionCheckInterval = setInterval(() => {
      if (!isConnected) {
        console.log("Connection check: Not connected, attempting to reconnect...")
        derivAPI.disconnect()
        setTimeout(() => {
          // The DerivAPI class will automatically try to reconnect
        }, 1000)
      }
    }, 30000)

    return () => {
      console.log("Cleaning up Deriv API connection")
      clearInterval(connectionCheckInterval)
      derivAPI.disconnect()
    }
  }, []) // Empty dependency array to run only once on mount

  // Generate demo data when API connection fails
  const generateOfflineData = () => {
    console.log("Generating offline mode data")

    // Generate random price data
    const basePrice = 312.74 // Base price for volatility 25
    const prices = Array.from({ length: 500 }, (_, i) => {
      const randomOffset = (Math.random() - 0.5) * 10
      return (basePrice + randomOffset).toFixed(2)
    })

    // Extract digits from prices
    const digits = prices.map((price) => {
      const decimalPart = price.split(".")[1] || "00"
      return Number.parseInt(decimalPart[1] || "0")
    })

    setRecentDigits(digits)

    // Calculate digit frequency
    const digitCounts: Record<number, number> = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    }

    digits.forEach((digit) => {
      digitCounts[digit]++
    })

    setDigitHistory(digitCounts)

    // Update digit percentages based on demo data
    updateDigitPercentages(digitCounts, digits.length)

    // Set the current value based on the most recent price
    const latestPrice = prices[prices.length - 1]
    setCurrentValue(latestPrice)

    // Extract parts for display
    const parts = latestPrice.split(".")
    const wholePart = parts[0]
    const decimalPart = parts[1] || "00"

    setDisplayValue(`${wholePart}.${decimalPart[0] || "0"}`)
    const newLastDigit = decimalPart[1] || "0"
    setLastDigit(newLastDigit)

    // Start a demo tick simulation
    startOfflineTickSimulation()
  }

  // Simulate ticks for demo mode
  const startOfflineTickSimulation = () => {
    const tickInterval = setInterval(() => {
      const basePrice = Number.parseFloat(currentValue)
      const randomOffset = (Math.random() - 0.5) * 0.2
      const newPrice = (basePrice + randomOffset).toFixed(2)

      setCurrentValue(newPrice)

      // Extract parts for display
      const parts = newPrice.split(".")
      const wholePart = parts[0]
      const decimalPart = parts[1] || "00"

      setDisplayValue(`${wholePart}.${decimalPart[0] || "0"}`)
      const newLastDigit = decimalPart[1] || "0"
      setLastDigit(newLastDigit)

      // Add to recent digits for percentage calculation
      const newDigit = Number.parseInt(newLastDigit)
      setRecentDigits((prev) => {
        const updated = [...prev, newDigit]
        // Keep only the last 500 digits
        return updated.slice(-500)
      })

      // Update digit history
      setDigitHistory((prev) => {
        const updated = { ...prev }
        updated[newDigit] = (updated[newDigit] || 0) + 1
        return updated
      })
    }, 1000) // Simulate a tick every second

    // Store the interval ID for cleanup
    return tickInterval
  }

  // Update the initial history fetch
  const fetchInitialHistory = async () => {
    setIsLoading(true)
    try {
      console.log("Attempting to fetch history for symbol:", volatilitySymbol)
      setConnectionError("Loading market data...")

      // Add a retry mechanism
      let attempts = 0
      const maxAttempts = 3
      let response

      while (attempts < maxAttempts) {
        try {
          console.log(`Fetch attempt ${attempts + 1} of ${maxAttempts}...`)
          response = await derivAPI.getTickHistory(volatilitySymbol, 500)

          // If we get a response without an error, break out of the retry loop
          if (response && !response.error) {
            break
          }

          // If we got an error, wait before retrying
          if (response && response.error) {
            console.error("API error on attempt", attempts + 1, ":", response.error)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
          }
        } catch (error) {
          console.error("Error on attempt", attempts + 1, ":", error)
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second before retry
        }

        attempts++
      }

      if (!response || response.error) {
        console.error("API returned error after", maxAttempts, "attempts:", response?.error || "No response")
        setConnectionError(`Error: ${response?.error?.message || "Failed to fetch market data"}`)
        generateOfflineData()
        return
      }

      setConnectionError(null)

      if (response.history && response.history.prices) {
        const prices = response.history.prices
        const times = response.history.times

        console.log(`Received ${prices.length} historical price points`)

        const digits = prices.map((price) => {
          // Convert price to string before splitting
          const priceStr = String(price)
          const decimalPart = priceStr.split(".")[1] || "00"
          return Number.parseInt(decimalPart[1] || "0")
        })

        setRecentDigits(digits)

        // Calculate digit frequency
        const digitCounts: Record<number, number> = {
          0: 0,
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
          6: 0,
          7: 0,
          8: 0,
          9: 0,
        }

        digits.forEach((digit) => {
          digitCounts[digit]++
        })

        setDigitHistory(digitCounts)

        // Update digit percentages based on real data
        updateDigitPercentages(digitCounts, digits.length)

        // Set the current value based on the most recent price
        if (prices.length > 0) {
          const latestPrice = String(prices[prices.length - 1])
          setCurrentValue(latestPrice)

          // Extract parts for display
          const parts = latestPrice.split(".")
          const wholePart = parts[0]
          const decimalPart = parts[1] || "00"

          setDisplayValue(`${wholePart}.${decimalPart[0] || "0"}`)
          const newLastDigit = decimalPart[1] || "0"
          setLastDigit(newLastDigit)
        }
      } else {
        console.warn("No history data in response:", response)
        setConnectionError("Received empty data from Deriv API.")
        generateOfflineData()
      }
    } catch (error) {
      console.error("Error fetching tick history:", error)
      setConnectionError("Failed to fetch market data.")
      generateOfflineData()
    } finally {
      setIsLoading(false)
    }
  }

  // Update the useEffect that calls fetchInitialHistory
  useEffect(() => {
    if (isConnected && volatilitySymbol) {
      // Only fetch history when volatility symbol changes, not on initial connection
      if (volatilitySymbol !== "1HZ25V") {
        fetchInitialHistory()
      }
    }
  }, [volatilitySymbol, isConnected])

  // Subscribe to ticks for the selected volatility
  useEffect(() => {
    if (!isConnected) return

    const handleTick = (response: any) => {
      if (response.tick && response.tick.quote) {
        // Ensure price is a string
        const price = String(response.tick.quote)
        setCurrentValue(price)

        // Extract parts for display
        const parts = price.split(".")
        const wholePart = parts[0]
        const decimalPart = parts[1] || "00"

        setDisplayValue(`${wholePart}.${decimalPart[0] || "0"}`)
        const newLastDigit = decimalPart[1] || "0"
        setLastDigit(newLastDigit)

        // Add to recent digits for percentage calculation
        const newDigit = Number.parseInt(newLastDigit)
        setRecentDigits((prev) => {
          const updated = [...prev, newDigit]
          // Keep only the last 500 digits
          return updated.slice(-500)
        })

        // Update digit history
        setDigitHistory((prev) => {
          const updated = { ...prev }
          updated[newDigit] = (updated[newDigit] || 0) + 1
          return updated
        })
      }
    }

    // Subscribe to ticks
    let subscriptionId: number
    const subscribe = async () => {
      try {
        subscriptionId = await derivAPI.subscribeTicks(volatilitySymbol, handleTick)
      } catch (error) {
        console.error("Error subscribing to ticks:", error)
        setConnectionError("Failed to subscribe to market data.")
        generateOfflineData()
      }
    }

    subscribe()

    return () => {
      // Unsubscribe when component unmounts or volatility changes
      derivAPI.unsubscribeTicks(volatilitySymbol)
    }
  }, [isConnected, volatilitySymbol])

  // Update percentages based on recent digits
  useEffect(() => {
    if (percentageTimerRef.current) clearInterval(percentageTimerRef.current)

    // Update percentages periodically
    percentageTimerRef.current = setInterval(() => {
      if (isPredicting || recentDigits.length === 0) return // Don't update percentages during prediction or if no data

      // Calculate total digits
      const totalDigits = Object.values(digitHistory).reduce((sum, count) => sum + count, 0)

      // Update percentages based on real data
      updateDigitPercentages(digitHistory, totalDigits)
    }, 1000) // Update percentages every second

    return () => {
      if (percentageTimerRef.current) clearInterval(percentageTimerRef.current)
    }
  }, [digitHistory, isPredicting, showPrediction, predictedDigit])

  // Handle start countdown timer
  useEffect(() => {
    if (startCountdown > 0) {
      startTimerRef.current = setInterval(() => {
        setStartCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(startTimerRef.current as NodeJS.Timeout)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (startTimerRef.current) clearInterval(startTimerRef.current)
    }
  }, [startCountdown])

  // Handle volatility change
  const handleVolatilityChange = (symbol: string) => {
    setVolatilitySymbol(symbol)

    const volatilityInfo = volatilitySymbols[symbol as keyof typeof volatilitySymbols]
    if (volatilityInfo) {
      setVolatilityName(volatilityInfo.name)
      setVolatilityCode(volatilityInfo.code)
      setVolatilitySpeed(volatilityInfo.speed)
    }

    // Reset recent digits and digit history when changing volatility
    setRecentDigits([])
    setDigitHistory({
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
    })
  }

  const handleDigitSelect = (digit: number) => {
    // Update the digitData to reflect the new selection
    const updatedDigitData = digitData.map((item) => ({
      ...item,
      selected: item.digit === digit,
    }))

    setDigitData(updatedDigitData)
    setSelectedDigit(digit)
  }

  const handlePrediction = () => {
    setIsPredicting(true)
    // Reset start countdown
    setStartCountdown(0)

    // Simulate prediction analysis
    setTimeout(() => {
      // Enhanced analysis using recent patterns for more accurate predictions
      const recentHistory = recentDigits.slice(-100) // Analyze more digits for better accuracy
      const digitCounts = { ...digitHistory }
      const totalDigits = Object.values(digitCounts).reduce((sum, count) => sum + count, 0)

      // Initialize prediction variables
      let prediction
      let recommendedVolatility
      let recommendedDuration
      let recommendedAction
      let recommendedRuns
      let recommendedNumber
      let optimalStartTime

      if (totalDigits === 0) {
        // No data, random prediction
        prediction = Math.floor(Math.random() * 10)
        optimalStartTime = 5 // Default start time
      } else {
        // Advanced pattern analysis for improved prediction accuracy

        // 1. Find patterns in recent history (last 100 digits)
        const patterns = {}
        const patternLength = 4 // Look for patterns of 4 digits (increased from 3)

        // Build pattern dictionary
        for (let i = 0; i < recentHistory.length - patternLength; i++) {
          const pattern = recentHistory.slice(i, i + patternLength).join("")
          const nextDigit = recentHistory[i + patternLength]

          if (!patterns[pattern]) {
            patterns[pattern] = []
          }
          patterns[pattern].push(nextDigit)
        }

        // 2. Check if current sequence matches any known pattern
        const currentPattern = recentHistory.slice(-patternLength).join("")

        if (patterns[currentPattern] && patterns[currentPattern].length > 0) {
          // If we have a pattern match, use the most common next digit
          const nextDigitCounts = {}
          patterns[currentPattern].forEach((digit) => {
            nextDigitCounts[digit] = (nextDigitCounts[digit] || 0) + 1
          })

          let maxCount = 0
          let mostLikelyNext = 0

          Object.entries(nextDigitCounts).forEach(([digit, count]) => {
            if (Number(count) > maxCount) {
              maxCount = Number(count)
              mostLikelyNext = Number(digit)
            }
          })

          prediction = mostLikelyNext
          console.log(`Pattern match found: ${currentPattern} → ${prediction}`)

          // Higher confidence in pattern-based predictions
          optimalStartTime = 3 // Start sooner for pattern-based predictions
        } else {
          // 3. If no pattern match, use advanced frequency analysis with trend detection

          // Calculate frequency of each digit in different time windows
          const recentWindow = recentHistory.slice(-20) // Last 20 digits
          const midWindow = recentHistory.slice(-50, -20) // 21-50 digits ago
          const farWindow = recentHistory.slice(-100, -50) // 51-100 digits ago

          const recentFreq = Array(10).fill(0)
          const midFreq = Array(10).fill(0)
          const farFreq = Array(10).fill(0)

          recentWindow.forEach((digit) => recentFreq[digit]++)
          midWindow.forEach((digit) => midFreq[digit]++)
          farWindow.forEach((digit) => farFreq[digit]++)

          // Calculate trend strength for each digit
          const trendStrength = Array(10).fill(0)

          for (let i = 0; i < 10; i++) {
            const recentRatio = recentFreq[i] / recentWindow.length || 0
            const midRatio = midFreq[i] / midWindow.length || 0
            const farRatio = farFreq[i] / farWindow.length || 0

            // Positive trend: increasing frequency
            // Negative trend: decreasing frequency
            trendStrength[i] = recentRatio - midRatio + (midRatio - farRatio)
          }

          // Find digits with strongest positive and negative trends
          let strongestPositive = -1
          let strongestNegative = -1
          let maxPositive = Number.NEGATIVE_INFINITY
          let maxNegative = Number.NEGATIVE_INFINITY

          for (let i = 0; i < 10; i++) {
            if (trendStrength[i] > maxPositive) {
              maxPositive = trendStrength[i]
              strongestPositive = i
            }
            if (trendStrength[i] < maxNegative) {
              maxNegative = trendStrength[i]
              strongestNegative = i
            }
          }

          // Find digits that haven't appeared recently
          const recentSet = new Set(recentWindow)
          const missingDigits = []

          for (let i = 0; i < 10; i++) {
            if (!recentSet.has(i)) {
              missingDigits.push(i)
            }
          }

          // Make prediction based on trends and missing digits
          if (missingDigits.length > 0 && Math.random() < 0.5) {
            // 50% chance to predict a missing digit
            prediction = missingDigits[Math.floor(Math.random() * missingDigits.length)]
            console.log(`Using missing digit: ${prediction}`)
            optimalStartTime = 5 // Medium confidence
          } else if (strongestNegative !== -1 && Math.random() < 0.7) {
            // 70% chance to predict a digit with strong negative trend (due for comeback)
            prediction = strongestNegative
            console.log(`Using negative trend digit: ${prediction}`)
            optimalStartTime = 4 // Medium confidence
          } else if (strongestPositive !== -1) {
            // Otherwise use digit with positive trend
            prediction = strongestPositive
            console.log(`Using positive trend digit: ${prediction}`)
            optimalStartTime = 6 // Lower confidence
          } else {
            // Fallback to least frequent digit overall
            let minFreq = Number.POSITIVE_INFINITY
            let leastFrequent = 0

            for (let i = 0; i < 10; i++) {
              const totalFreq = recentFreq[i] + midFreq[i] + farFreq[i]
              if (totalFreq < minFreq && totalFreq > 0) {
                minFreq = totalFreq
                leastFrequent = i
              }
            }

            prediction = leastFrequent
            console.log(`Using least frequent digit: ${prediction}`)
            optimalStartTime = 7 // Lowest confidence
          }
        }
      }

      // Generate recommendations based on trading type
      if (tradingType === "even-odd") {
        // For Even/Odd trading - enhanced algorithm
        const evenCount = recentDigits.filter((d) => d % 2 === 0).length
        const oddCount = recentDigits.length - evenCount
        const evenPercentage = evenCount / recentDigits.length

        // Analyze streaks of even/odd
        const streaks = []
        let currentType = recentDigits[0] % 2
        let currentStreak = 1

        for (let i = 1; i < recentDigits.length; i++) {
          if (recentDigits[i] % 2 === currentType) {
            currentStreak++
          } else {
            streaks.push({ type: currentType, length: currentStreak })
            currentType = recentDigits[i] % 2
            currentStreak = 1
          }
        }

        streaks.push({ type: currentType, length: currentStreak })

        // Calculate average streak length
        const avgStreakLength = streaks.reduce((sum, s) => sum + s.length, 0) / streaks.length

        // Determine volatility based on streak patterns
        if (avgStreakLength > 4) {
          recommendedVolatility = "1HZ25V" // More stable patterns
        } else if (avgStreakLength > 2) {
          recommendedVolatility = "1HZ50V" // Moderate patterns
        } else {
          recommendedVolatility = "1HZ75V" // Highly variable patterns
        }

        // Recommend runs based on streak analysis
        recommendedRuns = Math.max(3, Math.min(7, Math.ceil(avgStreakLength * 1.5)))

        // Predict next even/odd based on current streak and historical balance
        const currentEvenOddStreak = streaks[streaks.length - 1]

        if (currentEvenOddStreak.length > avgStreakLength * 1.5) {
          // If current streak is much longer than average, predict a change
          recommendedAction = currentEvenOddStreak.type === 0 ? "Odd" : "Even"
        } else if (evenPercentage > 0.6) {
          // If too many evens historically, predict odd
          recommendedAction = "Odd"
        } else if (evenPercentage < 0.4) {
          // If too many odds historically, predict even
          recommendedAction = "Even"
        } else {
          // Otherwise use the predicted digit
          recommendedAction = prediction % 2 === 0 ? "Even" : "Odd"
        }
      } else if (tradingType === "over-under") {
        // For Over/Under trading - enhanced algorithm

        // Find optimal threshold by analyzing digit distribution
        const digitDistribution = Array(10).fill(0)
        recentDigits.forEach((d) => digitDistribution[d]++)

        // Calculate cumulative distribution
        const cumulativeDistribution = []
        let sum = 0

        for (let i = 0; i < 10; i++) {
          sum += digitDistribution[i]
          cumulativeDistribution[i] = sum
        }

        // Find threshold that creates closest to 50/50 split
        let bestThreshold = 4
        let bestDiff = Number.POSITIVE_INFINITY

        for (let i = 0; i < 9; i++) {
          const ratio = cumulativeDistribution[i] / sum
          const diff = Math.abs(ratio - 0.5)

          if (diff < bestDiff) {
            bestDiff = diff
            bestThreshold = i
          }
        }

        recommendedNumber = bestThreshold

        // Analyze digit transitions to determine volatility
        let transitions = 0
        for (let i = 1; i < recentDigits.length; i++) {
          if (
            (recentDigits[i - 1] <= bestThreshold && recentDigits[i] > bestThreshold) ||
            (recentDigits[i - 1] > bestThreshold && recentDigits[i] <= bestThreshold)
          ) {
            transitions++
          }
        }

        const transitionRate = transitions / (recentDigits.length - 1)

        // Select volatility based on transition rate
        if (transitionRate > 0.5) {
          recommendedVolatility = "1HZ100V" // High transition rate
        } else if (transitionRate > 0.3) {
          recommendedVolatility = "1HZ75V" // Medium transition rate
        } else {
          recommendedVolatility = "1HZ50V" // Low transition rate
        }

        // Calculate optimal duration based on transition patterns
        const avgTransitionInterval = (recentDigits.length - 1) / (transitions || 1)
        const durationOptions = [10, 15, 20, 30]
        const optimalDurationIndex = Math.min(Math.floor(avgTransitionInterval / 5), durationOptions.length - 1)

        recommendedDuration = durationOptions[optimalDurationIndex]

        // Determine if we're due for a transition
        let lastTransitionIndex = 0
        for (let i = recentDigits.length - 1; i > 0; i--) {
          if (
            (recentDigits[i - 1] <= bestThreshold && recentDigits[i] > bestThreshold) ||
            (recentDigits[i - 1] > bestThreshold && recentDigits[i] <= bestThreshold)
          ) {
            lastTransitionIndex = recentDigits.length - i
            break
          }
        }

        // If we're overdue for a transition, predict one
        if (lastTransitionIndex > avgTransitionInterval * 1.2) {
          const currentState = recentDigits[recentDigits.length - 1] > bestThreshold
          recommendedAction = currentState ? "Under" : "Over"
        } else {
          // Otherwise use the predicted digit
          recommendedAction = prediction > bestThreshold ? "Over" : "Under"
        }
      }

      setPredictedDigit(prediction)
      setRecommendedVolatility(recommendedVolatility)
      setRecommendedDuration(recommendedDuration)
      setRecommendedAction(recommendedAction)
      setRecommendedRuns(recommendedRuns)
      setRecommendedNumber(recommendedNumber)
      setOptimalStartTime(optimalStartTime || 5) // Default to 5 seconds if not set

      // Update UI to show prediction and start countdown
      setIsPredicting(false)
      setShowPrediction(true)
      setStartCountdown(optimalStartTime || 5)
    }, 2000)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleAccountSection = () => {
    setShowAccountSection(!showAccountSection)
  }

  const handleAppLogout = () => {
    logout()
    router.push("/login")
  }

  // Prevent hydration mismatch
  if (!mounted) return null

  const isDarkTheme = theme === "dark"

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto min-h-screen flex flex-col",
        isDarkTheme ? "bg-[#1C1F2D] text-white" : "bg-gray-100 text-gray-900",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 flex items-center justify-between border-b",
          isDarkTheme ? "bg-[#0E0F15] border-gray-800" : "bg-white border-gray-200",
        )}
      >
        <MainNav />

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={isDarkTheme ? "text-white hover:bg-gray-800" : "text-gray-900 hover:bg-gray-200"}
          >
            {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <div className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAccountSection}
            className={cn("relative", isDarkTheme ? "text-white hover:bg-gray-800" : "text-gray-900 hover:bg-gray-200")}
          >
            <User className="h-6 w-6" />
            {isLoggedIn && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></span>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <div className="bg-[#2196F3] rounded-full p-1">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className={isDarkTheme ? "text-[#00C9B7]" : "text-[#00A99D]"} style={{ fontWeight: 600 }}>
              {isLoggedIn && accountInfo?.balance ? `${accountInfo.balance} ${accountInfo.currency}` : "0.00 USDC"}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleAppLogout}
            className={isDarkTheme ? "text-white hover:bg-gray-800" : "text-gray-900 hover:bg-gray-200"}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {isInitializing && (
        <div className={cn("p-3 text-center", isDarkTheme ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800")}>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Initializing Deriv Analysis...
          </div>
        </div>
      )}

      {!isConnected && !isInitializing && (
        <div
          className={cn("p-3 text-center", isDarkTheme ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-800")}
        >
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {connectionError || "No connection to Deriv API"}
          </div>
        </div>
      )}

      {isConnected && connectionError && (
        <div
          className={cn(
            "p-2 text-center text-sm",
            isDarkTheme ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800",
          )}
        >
          {connectionError}
        </div>
      )}

      {connectionError && !isInitializing && (
        <div className="flex justify-center p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Set connecting state
              setConnectionError("Reconnecting to Deriv API...")

              // Attempt to reconnect
              derivAPI.disconnect()
              setTimeout(() => {
                // The DerivAPI class will automatically try to reconnect
                // but we'll force a page refresh if it takes too long
                const reconnectTimeout = setTimeout(() => {
                  window.location.reload()
                }, 5000)

                // If we connect successfully before timeout, clear the timeout
                derivAPI.onOpen(() => {
                  clearTimeout(reconnectTimeout)
                })
              }, 500)
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </Button>
        </div>
      )}

      {/* Account Section */}
      {showAccountSection && (
        <div className="p-4" id="account-section">
          <AccountSection />
        </div>
      )}

      {/* Trading Type Tabs */}
      <div className={cn("flex justify-between p-3", isDarkTheme ? "bg-[#1C1F2D]" : "bg-gray-100")}>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full",
            tradingType === "over-under"
              ? isDarkTheme
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-800"
              : isDarkTheme
                ? "text-gray-400 hover:text-white hover:bg-[#2A2D3A]"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200",
          )}
          onClick={() => setTradingType("over-under")}
        >
          Over/Under
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full",
            tradingType === "matches-differs"
              ? isDarkTheme
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-800"
              : isDarkTheme
                ? "text-gray-400 hover:text-white hover:bg-[#2A2D3A]"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200",
          )}
          onClick={() => setTradingType("matches-differs")}
        >
          Matches/Differs
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "rounded-full",
            tradingType === "even-odd"
              ? isDarkTheme
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-gray-900 text-white hover:bg-gray-800"
              : isDarkTheme
                ? "text-gray-400 hover:text-white hover:bg-[#2A2D3A]"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200",
          )}
          onClick={() => setTradingType("even-odd")}
        >
          Even/Odd
        </Button>
      </div>

      {/* Market Selection */}
      <div className={cn("p-4 flex items-center gap-3 border-b", isDarkTheme ? "border-gray-800" : "border-gray-200")}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById("volatility-select")?.click()}
        >
          <div className="relative">
            <div
              className={cn(
                "border rounded p-1",
                isDarkTheme ? "bg-[#1C1F2D] border-gray-700" : "bg-white border-gray-300",
              )}
            >
              <div
                className={`text-xs font-bold ${volatilityCode === "100" ? "bg-[#E31C1C]" : volatilityCode === "75" ? "bg-[#FF6D00]" : volatilityCode === "50" ? "bg-[#4CAF50]" : volatilityCode === "25" ? "bg-[#2196F3]" : "bg-[#9C27B0]"} text-white rounded px-1 absolute -top-2 -right-2`}
              >
                {volatilitySpeed}
              </div>
              <span className="text-xs font-bold">{volatilityCode}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{volatilityName.replace("Deriv ", "")}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className={cn("text-sm", isDarkTheme ? "text-gray-400" : "text-gray-500")}>{currentValue}</div>
          </div>
        </div>

        <Select
          value={volatilitySymbol}
          onValueChange={handleVolatilityChange}
          id="volatility-select"
          className="hidden"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select volatility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1HZ100V">Volatility 100 (1s) Index</SelectItem>
            <SelectItem value="1HZ75V">Volatility 75 (1s) Index</SelectItem>
            <SelectItem value="1HZ50V">Volatility 50 (1s) Index</SelectItem>
            <SelectItem value="1HZ25V">Volatility 25 (1s) Index</SelectItem>
            <SelectItem value="1HZ10V">Volatility 10 (1s) Index</SelectItem>
            <SelectItem value="2HZ100V">Volatility 100 (2s) Index</SelectItem>
            <SelectItem value="2HZ50V">Volatility 50 (2s) Index</SelectItem>
            <SelectItem value="5HZ100V">Volatility 100 (5s) Index</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main content */}
      <div className="w-full">
        <div className="mt-0">
          {/* Current Value Display */}
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold">
              {displayValue}
              <span
                className={cn(
                  "text-6xl ml-2",
                  showPrediction && predictedDigit?.toString() === lastDigit ? "text-green-500" : "",
                )}
              >
                {lastDigit}
              </span>
            </div>

            {/* Start Countdown Timer */}
            {startCountdown > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
                <span className="text-orange-500 font-bold">Start trading in {startCountdown}s</span>
              </div>
            )}
          </div>

          {/* Trading Interface */}
          <div className="flex flex-col md:flex-row gap-4 p-4">
            {/* Left column - Digit prediction */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className={cn("text-xl", isDarkTheme ? "text-gray-400" : "text-gray-600")}>Set your trade</h2>
                <Button
                  variant="outline"
                  className={cn("gap-2", isDarkTheme ? "border-gray-700 text-white" : "border-gray-300 text-gray-900")}
                >
                  <HelpCircle className="h-5 w-5" />
                  Guide
                </Button>
              </div>

              {/* Digit Prediction */}
              <div className={cn("rounded-lg p-4", isDarkTheme ? "bg-[#131722]" : "bg-white shadow-sm")}>
                <h3 className={isDarkTheme ? "text-gray-400 mb-4" : "text-gray-600 mb-4"}>Last digit prediction</h3>

                <div className="grid grid-cols-5 gap-3">
                  {digitData.slice(0, 5).map((item) => (
                    <div
                      key={item.digit}
                      onClick={() => handleDigitSelect(item.digit)}
                      className={cn(
                        "rounded-lg p-3 flex flex-col items-center cursor-pointer transition-all",
                        isDarkTheme
                          ? item.selected
                            ? "bg-white text-black"
                            : "bg-black hover:bg-gray-900"
                          : item.selected
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 hover:bg-gray-200",
                        showPrediction && predictedDigit === item.digit ? "ring-2 ring-green-500" : "",
                      )}
                    >
                      <div className="text-2xl font-bold">{item.digit}</div>
                      <div
                        className={cn(
                          "text-sm transition-all",
                          item.highlight === "red"
                            ? "text-red-500"
                            : item.highlight === "green"
                              ? "text-green-500"
                              : isDarkTheme
                                ? item.selected
                                  ? "text-black"
                                  : "text-gray-400"
                                : item.selected
                                  ? "text-white"
                                  : "text-gray-600",
                        )}
                      >
                        {item.percentage}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-5 gap-3 mt-3">
                  {digitData.slice(5, 10).map((item) => (
                    <div
                      key={item.digit}
                      onClick={() => handleDigitSelect(item.digit)}
                      className={cn(
                        "rounded-lg p-3 flex flex-col items-center cursor-pointer transition-all",
                        isDarkTheme
                          ? item.selected
                            ? "bg-white text-black"
                            : "bg-black hover:bg-gray-900"
                          : item.selected
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 hover:bg-gray-200",
                        showPrediction && predictedDigit === item.digit ? "ring-2 ring-green-500" : "",
                      )}
                    >
                      <div className="text-2xl font-bold">{item.digit}</div>
                      <div
                        className={cn(
                          "text-sm transition-all",
                          item.highlight === "red"
                            ? "text-red-500"
                            : item.highlight === "green"
                              ? "text-green-500"
                              : isDarkTheme
                                ? item.selected
                                  ? "text-black"
                                  : "text-gray-400"
                                : item.selected
                                  ? "text-white"
                                  : "text-gray-600",
                        )}
                      >
                        {item.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                <Button
                  className={cn(
                    "h-14 text-lg font-bold",
                    tradingType === "matches-differs"
                      ? "bg-[#FF444F] hover:bg-[#E31C1C]"
                      : tradingType === "over-under"
                        ? "bg-[#FF6D00] hover:bg-[#E65100]"
                        : "bg-[#9C27B0] hover:bg-[#7B1FA2]",
                  )}
                  onClick={() => {
                    /* Add action */
                  }}
                >
                  {tradingType === "matches-differs" ? "Differs" : tradingType === "over-under" ? "Under" : "Odd"}
                </Button>

                {/* Prediction Button */}
                <Button
                  className={cn(
                    "h-14 text-lg font-bold",
                    isPredicting ? "bg-gray-600 hover:bg-gray-700" : "bg-[#2196F3] hover:bg-[#1976D2]",
                  )}
                  onClick={handlePrediction}
                  disabled={isPredicting}
                >
                  {isPredicting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-1 animate-spin" />
                      <span className="text-sm">Analyzing</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-1" />
                      <span className="text-sm">Predict</span>
                    </>
                  )}
                </Button>

                <Button
                  className={cn(
                    "h-14 text-lg font-bold",
                    tradingType === "matches-differs"
                      ? "bg-[#4CAF50] hover:bg-[#3D9140]"
                      : tradingType === "over-under"
                        ? "bg-[#2196F3] hover:bg-[#1976D2]"
                        : "bg-[#4CAF50] hover:bg-[#3D9140]",
                  )}
                  onClick={() => {
                    /* Add action */
                  }}
                >
                  {tradingType === "matches-differs" ? "Matches" : tradingType === "over-under" ? "Over" : "Even"}
                </Button>
              </div>

              {/* Predicted Number Display */}
              {showPrediction && predictedDigit !== null && (
                <div className={cn("mt-4 p-4 rounded-lg", isDarkTheme ? "bg-[#131722]" : "bg-white shadow-sm")}>
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Predicted Digit</div>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white text-3xl font-bold">
                      {predictedDigit}
                    </div>
                  </div>

                  {tradingType === "even-odd" && recommendedAction && recommendedVolatility && recommendedRuns && (
                    <div className="mt-3 border-t pt-3 border-gray-200 dark:border-gray-700">
                      <h4 className="text-center font-medium mb-2">Recommendation</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <span className="text-gray-500 dark:text-gray-400">Volatility</span>
                          <span className="font-bold">
                            {volatilitySymbols[recommendedVolatility as keyof typeof volatilitySymbols]?.name.replace(
                              "Deriv ",
                              "",
                            ) || recommendedVolatility}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <span className="text-gray-500 dark:text-gray-400">Runs</span>
                          <span className="font-bold">{recommendedRuns}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">Play</span>
                          <span
                            className={`font-bold ${recommendedAction === "Even" ? "text-green-500" : "text-purple-500"}`}
                          >
                            {recommendedAction}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {tradingType === "over-under" &&
                    recommendedAction &&
                    recommendedVolatility &&
                    recommendedDuration &&
                    recommendedNumber !== undefined && (
                      <div className="mt-3 border-t pt-3 border-gray-200 dark:border-gray-700">
                        <h4 className="text-center font-medium mb-2">Recommendation</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Volatility</span>
                            <span className="font-bold">
                              {volatilitySymbols[recommendedVolatility as keyof typeof volatilitySymbols]?.name.replace(
                                "Deriv ",
                                "",
                              ) || recommendedVolatility}
                            </span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Duration</span>
                            <span className="font-bold">{recommendedDuration}s</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Number</span>
                            <span className="font-bold">{recommendedNumber}</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <span className="text-gray-500 dark:text-gray-400">Play</span>
                            <span
                              className={`font-bold ${recommendedAction === "Over" ? "text-blue-500" : "text-orange-500"}`}
                            >
                              {recommendedAction}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {tradingType === "matches-differs" && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Prediction: The next digit will be {predictedDigit}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right column - Trade form */}
            <div className="flex-1">
              <TradeForm symbol={volatilitySymbol} predictedDigit={predictedDigit} tradingType={tradingType} />
            </div>
          </div>
        </div>

        {/* Chart below trading interface */}
        <div className="p-4 mt-2">
          <h2 className={cn("text-xl mb-4", isDarkTheme ? "text-gray-300" : "text-gray-700")}>
            <BarChart2 className="h-5 w-5 inline mr-2" />
            Market Chart
          </h2>
          <DerivChart symbol={volatilitySymbol} height={450} />
        </div>
      </div>
    </div>
  )
}
