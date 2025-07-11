"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Repeat,
  AlertTriangle,
  BarChart2,
  ArrowRight,
  Loader2,
  RefreshCcw,
  Zap,
  Clock,
  Target,
  Hash,
  ArrowUpDown,
  Divide,
  BarChart3,
} from "lucide-react"

// Add these imports
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add volatility symbols (add this after the imports)
const volatilitySymbols = {
  "1HZ100V": { name: "Volatility 100 (1s) Index", code: "100", speed: "1s", baseValue: 683.31 },
  "1HZ75V": { name: "Volatility 75 (1s) Index", code: "75", speed: "1s", baseValue: 542.18 },
  "1HZ50V": { name: "Volatility 50 (1s) Index", code: "50", speed: "1s", baseValue: 421.56 },
  "1HZ25V": { name: "Volatility 25 (1s) Index", code: "25", speed: "1s", baseValue: 312.74 },
  "1HZ10V": { name: "Volatility 10 (1s) Index", code: "10", speed: "1s", baseValue: 156.92 },
}

interface TradingPatternsProps {
  priceHistory: number[]
  recentDigits: number[]
  isConnected: boolean
  className?: string
  onRecommendationsChange?: (recommendations: Recommendation[]) => void
  onPatternsChange?: (patterns: Pattern[]) => void
}

type Pattern = {
  id: string
  name: string
  description: string
  confidence: number
  type: "trend" | "reversal" | "continuation" | "digit" | "statistical"
  strategyType?: "even-odd" | "over-under" | "matches" | "differs"
  icon: React.ReactNode
  action?: string
  recommendation?: {
    strategy: string
    value: string | number
    confidence: number
  }
  timeDetected: Date
}

type Recommendation = {
  strategy: "even-odd" | "over-under" | "matches"
  value: string | number
  confidence: number
  description: string
  lastUpdated: Date
}

export default function TradingPatterns({
  priceHistory,
  recentDigits,
  isConnected,
  className,
  onRecommendationsChange,
  onPatternsChange,
}: TradingPatternsProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  const [mounted, setMounted] = useState(false)
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [animateIn, setAnimateIn] = useState(false)
  const prevPriceHistoryRef = useRef<number[]>([])
  const prevRecentDigitsRef = useRef<number[]>([])
  const [activeTab, setActiveTab] = useState<
    "all" | "trend" | "reversal" | "continuation" | "digit" | "statistical" | "even-odd" | "over-under" | "matches"
  >("all")
  const [liveIndicator, setLiveIndicator] = useState(0)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [lastDigit, setLastDigit] = useState<number | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [selectedVolatility, setSelectedVolatility] = useState<string>("all")
  const [volatilityInsights, setVolatilityInsights] = useState<any[]>([])

  // Handle theme mounting
  useEffect(() => {
    setMounted(true)
    // Trigger entrance animation after a short delay
    setTimeout(() => {
      setAnimateIn(true)
      setIsLoading(false)
    }, 500)

    // Set up live indicator animation
    const liveIndicatorInterval = setInterval(() => {
      setLiveIndicator((prev) => (prev + 1) % 3)
    }, 500)

    return () => {
      clearInterval(liveIndicatorInterval)
    }
  }, [])

  // Analyze data and detect patterns when price history or recent digits change
  useEffect(() => {
    if (
      priceHistory.length > 0 &&
      recentDigits.length > 0 &&
      (JSON.stringify(priceHistory) !== JSON.stringify(prevPriceHistoryRef.current) ||
        JSON.stringify(recentDigits) !== JSON.stringify(prevRecentDigitsRef.current))
    ) {
      // Update refs
      prevPriceHistoryRef.current = [...priceHistory]
      prevRecentDigitsRef.current = [...recentDigits]

      // Update last digit
      if (recentDigits.length > 0) {
        setLastDigit(recentDigits[recentDigits.length - 1])
      }

      // Set last update time
      setLastUpdateTime(new Date())

      // Trigger pulse animation
      setPulseAnimation(true)
      setTimeout(() => setPulseAnimation(false), 1000)

      // Analyze data and detect patterns
      detectPatterns(priceHistory, recentDigits)
    }
  }, [priceHistory, recentDigits])

  // Notify parent component of recommendations and patterns changes
  useEffect(() => {
    if (onRecommendationsChange) {
      onRecommendationsChange(recommendations)
    }
  }, [recommendations, onRecommendationsChange])

  useEffect(() => {
    if (onPatternsChange) {
      onPatternsChange(patterns)
    }
  }, [patterns, onPatternsChange])

  // Function to detect trading patterns
  const detectPatterns = (prices: number[], digits: number[]) => {
    setIsLoading(true)

    // Create a new array to store detected patterns
    const detectedPatterns: Pattern[] = []
    const newRecommendations: Recommendation[] = []

    // Only analyze if we have enough data
    if (prices.length >= 10 && digits.length >= 10) {
      // 1. Detect trend patterns
      detectTrendPatterns(prices, detectedPatterns)

      // 2. Detect digit patterns
      detectDigitPatterns(digits, detectedPatterns)

      // 3. Detect reversal patterns
      detectReversalPatterns(prices, detectedPatterns)

      // 4. Detect continuation patterns
      detectContinuationPatterns(prices, detectedPatterns)

      // 5. Detect statistical anomalies
      detectStatisticalPatterns(digits, detectedPatterns)

      // 6. Detect Even/Odd patterns and generate recommendation
      const evenOddRecommendation = detectEvenOddPatterns(digits, detectedPatterns)
      if (evenOddRecommendation) {
        newRecommendations.push(evenOddRecommendation)
      }

      // 7. Detect Over/Under patterns and generate recommendation
      const overUnderRecommendation = detectOverUnderPatterns(digits, detectedPatterns)
      if (overUnderRecommendation) {
        newRecommendations.push(overUnderRecommendation)
      }

      // 8. Detect Matches patterns and generate recommendation
      const matchesRecommendation = detectMatchesPatterns(digits, detectedPatterns)
      if (matchesRecommendation) {
        newRecommendations.push(matchesRecommendation)
      }
    }

    // Add volatility-specific analysis
    if (selectedVolatility !== "all") {
      const volatilityInfo = volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]
      if (volatilityInfo) {
        detectVolatilitySpecificPatterns(prices, digits, volatilityInfo, detectedPatterns)
      }
    }

    // Sort patterns by confidence (highest first)
    detectedPatterns.sort((a, b) => b.confidence - a.confidence)

    // Update state with detected patterns and recommendations
    setPatterns(detectedPatterns)
    setRecommendations(newRecommendations)
    setIsLoading(false)
  }

  // Function to detect volatility-specific patterns
  const detectVolatilitySpecificPatterns = (
    prices: number[],
    digits: number[],
    volatilityInfo: any,
    patterns: Pattern[],
  ) => {
    const volatilityLevel = Number.parseInt(volatilityInfo.code)
    const baseValue = volatilityInfo.baseValue

    // High volatility patterns (75-100)
    if (volatilityLevel >= 75) {
      // Check for rapid price movements
      const recentPrices = prices.slice(-10)
      if (recentPrices.length >= 5) {
        const priceChanges = recentPrices
          .map((price, index) => (index > 0 ? Math.abs(price - recentPrices[index - 1]) : 0))
          .slice(1)

        const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length
        const volatilityThreshold = baseValue * 0.01 // 1% of base value

        if (avgChange > volatilityThreshold) {
          patterns.push({
            id: `volatility-high-movement-${Date.now()}`,
            name: "High Volatility Movement",
            description: `Rapid price movements detected in ${volatilityInfo.name}`,
            confidence: Math.min(85, 60 + (avgChange / volatilityThreshold) * 10),
            type: "trend",
            icon: <Zap className="h-5 w-5 text-orange-500" />,
            action: "Consider quick entry/exit strategies",
            timeDetected: new Date(),
          })
        }
      }

      // High volatility digit clustering
      const recentDigits = digits.slice(-20)
      const digitCounts = Array(10).fill(0)
      recentDigits.forEach((digit) => digitCounts[digit]++)

      const maxCount = Math.max(...digitCounts)
      const clusterThreshold = recentDigits.length * 0.25 // 25% for high volatility

      if (maxCount >= clusterThreshold) {
        const dominantDigit = digitCounts.findIndex((count) => count === maxCount)
        patterns.push({
          id: `volatility-digit-cluster-${Date.now()}`,
          name: "High Volatility Digit Cluster",
          description: `Digit ${dominantDigit} dominates in high volatility environment`,
          confidence: Math.min(90, (maxCount / recentDigits.length) * 100 + 15),
          type: "statistical",
          icon: <BarChart2 className="h-5 w-5 text-red-500" />,
          action: `Strong signal for "Matches ${dominantDigit}"`,
          timeDetected: new Date(),
        })
      }
    }

    // Medium volatility patterns (25-75)
    else if (volatilityLevel >= 25 && volatilityLevel < 75) {
      // Check for steady trends
      const recentPrices = prices.slice(-15)
      if (recentPrices.length >= 10) {
        let trendDirection = 0
        for (let i = 1; i < recentPrices.length; i++) {
          if (recentPrices[i] > recentPrices[i - 1]) trendDirection++
          else if (recentPrices[i] < recentPrices[i - 1]) trendDirection--
        }

        const trendStrength = Math.abs(trendDirection) / (recentPrices.length - 1)

        if (trendStrength > 0.6) {
          patterns.push({
            id: `volatility-steady-trend-${Date.now()}`,
            name: "Medium Volatility Trend",
            description: `Steady ${trendDirection > 0 ? "upward" : "downward"} trend in ${volatilityInfo.name}`,
            confidence: Math.min(80, 50 + trendStrength * 40),
            type: "trend",
            icon:
              trendDirection > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              ),
            action: `Suitable for ${trendDirection > 0 ? "Over" : "Under"} strategies`,
            timeDetected: new Date(),
          })
        }
      }
    }

    // Low volatility patterns (10-25)
    else {
      // Check for consolidation patterns
      const recentPrices = prices.slice(-20)
      if (recentPrices.length >= 15) {
        const maxPrice = Math.max(...recentPrices)
        const minPrice = Math.min(...recentPrices)
        const priceRange = maxPrice - minPrice
        const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length
        const consolidationRatio = priceRange / avgPrice

        if (consolidationRatio < 0.01) {
          // Very tight range
          patterns.push({
            id: `volatility-consolidation-${Date.now()}`,
            name: "Low Volatility Consolidation",
            description: `Tight price consolidation in ${volatilityInfo.name}`,
            confidence: Math.min(85, 70 + (1 - consolidationRatio * 100) * 15),
            type: "continuation",
            icon: <Repeat className="h-5 w-5 text-blue-500" />,
            action: "Prepare for potential breakout",
            timeDetected: new Date(),
          })
        }
      }

      // Low volatility even/odd patterns are more reliable
      const recentDigits = digits.slice(-30)
      const evenCount = recentDigits.filter((digit) => digit % 2 === 0).length
      const evenPercentage = (evenCount / recentDigits.length) * 100

      if (Math.abs(evenPercentage - 50) > 8) {
        // Lower threshold for low volatility
        const isEvenBias = evenPercentage > 50
        patterns.push({
          id: `volatility-low-even-odd-${Date.now()}`,
          name: "Low Volatility Even/Odd Pattern",
          description: `Reliable ${isEvenBias ? "even" : "odd"} bias in low volatility environment`,
          confidence: Math.min(85, 60 + Math.abs(evenPercentage - 50) * 2),
          type: "statistical",
          strategyType: "even-odd",
          icon: <Divide className="h-5 w-5 text-purple-500" />,
          action: `High confidence "${isEvenBias ? "Even" : "Odd"}" play`,
          recommendation: {
            strategy: "even-odd",
            value: isEvenBias ? "Even" : "Odd",
            confidence: Math.min(85, 60 + Math.abs(evenPercentage - 50) * 2),
          },
          timeDetected: new Date(),
        })
      }
    }
  }

  // Function to detect trend patterns
  const detectTrendPatterns = (prices: number[], patterns: Pattern[]) => {
    // Need at least 10 prices for trend analysis
    if (prices.length < 10) return

    // Get the last 20 prices or all if less than 20
    const recentPrices = prices.slice(-Math.min(20, prices.length))

    // Calculate price changes
    const priceChanges = recentPrices.map((price, index) => (index > 0 ? price - recentPrices[index - 1] : 0)).slice(1)

    // Count positive and negative changes
    const positiveChanges = priceChanges.filter((change) => change > 0).length
    const negativeChanges = priceChanges.filter((change) => change < 0).length

    // Calculate trend strength
    const totalChanges = priceChanges.length
    const positiveRatio = positiveChanges / totalChanges
    const negativeRatio = negativeChanges / totalChanges

    // Detect uptrend
    if (positiveRatio >= 0.65) {
      patterns.push({
        id: `trend-up-${Date.now()}`,
        name: "Uptrend Detected",
        description: `Strong upward price movement with ${Math.round(positiveRatio * 100)}% positive changes`,
        confidence: Math.min(positiveRatio * 100, 95),
        type: "trend",
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        action: 'Consider "Over" positions',
        timeDetected: new Date(),
      })
    }

    // Detect downtrend
    if (negativeRatio >= 0.65) {
      patterns.push({
        id: `trend-down-${Date.now()}`,
        name: "Downtrend Detected",
        description: `Strong downward price movement with ${Math.round(negativeRatio * 100)}% negative changes`,
        confidence: Math.min(negativeRatio * 100, 95),
        type: "trend",
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
        action: 'Consider "Under" positions',
        timeDetected: new Date(),
      })
    }

    // Detect sideways/consolidation
    if (positiveRatio > 0.4 && positiveRatio < 0.6 && negativeRatio > 0.4 && negativeRatio < 0.6) {
      // Calculate price volatility
      const maxPrice = Math.max(...recentPrices)
      const minPrice = Math.min(...recentPrices)
      const priceRange = maxPrice - minPrice
      const avgPrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length
      const volatility = priceRange / avgPrice

      if (volatility < 0.02) {
        // Low volatility threshold
        patterns.push({
          id: `trend-sideways-${Date.now()}`,
          name: "Consolidation Pattern",
          description: "Price moving sideways with low volatility, potential breakout ahead",
          confidence: Math.min((1 - volatility * 50) * 100, 90),
          type: "trend",
          icon: <Repeat className="h-5 w-5 text-blue-500" />,
          action: "Prepare for potential breakout",
          timeDetected: new Date(),
        })
      }
    }
  }

  // Function to detect digit patterns
  const detectDigitPatterns = (digits: number[], patterns: Pattern[]) => {
    // Need at least 10 digits for pattern analysis
    if (digits.length < 10) return

    // Get the last 20 digits or all if less than 20
    const recentDigits = digits.slice(-Math.min(20, digits.length))

    // Check for repeating digits
    const lastDigit = recentDigits[recentDigits.length - 1]
    const secondLastDigit = recentDigits[recentDigits.length - 2]
    const thirdLastDigit = recentDigits[recentDigits.length - 3]

    // Detect triple repeat
    if (lastDigit === secondLastDigit && lastDigit === thirdLastDigit) {
      patterns.push({
        id: `digit-triple-${Date.now()}`,
        name: "Triple Digit Repeat",
        description: `Digit ${lastDigit} has appeared three times in a row`,
        confidence: 85,
        type: "digit",
        icon: <Repeat className="h-5 w-5 text-purple-500" />,
        action: 'Consider "Differs" for next digit',
        timeDetected: new Date(),
      })
    }

    // Detect alternating pattern (e.g., 5,7,5,7)
    if (
      recentDigits.length >= 4 &&
      lastDigit === recentDigits[recentDigits.length - 3] &&
      secondLastDigit === recentDigits[recentDigits.length - 4]
    ) {
      patterns.push({
        id: `digit-alternating-${Date.now()}`,
        name: "Alternating Digits",
        description: `Digits are alternating between ${lastDigit} and ${secondLastDigit}`,
        confidence: 75,
        type: "digit",
        icon: <RefreshCcw className="h-5 w-5 text-indigo-500" />,
        action: `Next digit likely to be ${secondLastDigit}`,
        timeDetected: new Date(),
      })
    }

    // Check for digit clusters
    const digitCounts = Array(10).fill(0)
    recentDigits.forEach((digit) => {
      digitCounts[digit]++
    })

    // Find the most frequent digit
    const maxCount = Math.max(...digitCounts)
    const mostFrequentDigit = digitCounts.findIndex((count) => count === maxCount)

    // If a digit appears significantly more often than expected
    if (maxCount >= recentDigits.length * 0.3) {
      // 30% threshold
      patterns.push({
        id: `digit-cluster-${Date.now()}`,
        name: "Digit Cluster",
        description: `Digit ${mostFrequentDigit} appears ${maxCount} times in recent sequence`,
        confidence: Math.min((maxCount / recentDigits.length) * 100 + 20, 90),
        type: "digit",
        icon: <BarChart2 className="h-5 w-5 text-amber-500" />,
        action: `Consider "Matches ${mostFrequentDigit}" positions`,
        timeDetected: new Date(),
      })
    }
  }

  // Function to detect reversal patterns
  const detectReversalPatterns = (prices: number[], patterns: Pattern[]) => {
    // Need at least 15 prices for reversal pattern analysis
    if (prices.length < 15) return

    // Get the last 30 prices or all if less than 30
    const recentPrices = prices.slice(-Math.min(30, prices.length))

    // Check for double top pattern
    const isDoubleTop = checkDoubleTop(recentPrices)
    if (isDoubleTop) {
      patterns.push({
        id: `reversal-double-top-${Date.now()}`,
        name: "Double Top Pattern",
        description: "Price reached similar high points twice and failed to break through",
        confidence: 80,
        type: "reversal",
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
        action: "Potential downward reversal",
        timeDetected: new Date(),
      })
    }

    // Check for double bottom pattern
    const isDoubleBottom = checkDoubleBottom(recentPrices)
    if (isDoubleBottom) {
      patterns.push({
        id: `reversal-double-bottom-${Date.now()}`,
        name: "Double Bottom Pattern",
        description: "Price reached similar low points twice and bounced back",
        confidence: 80,
        type: "reversal",
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        action: "Potential upward reversal",
        timeDetected: new Date(),
      })
    }
  }

  // Helper function to check for double top pattern
  const checkDoubleTop = (prices: number[]): boolean => {
    if (prices.length < 10) return false

    // Find local maxima
    const localMaxima: number[] = []
    for (let i = 2; i < prices.length - 2; i++) {
      if (
        prices[i] > prices[i - 1] &&
        prices[i] > prices[i - 2] &&
        prices[i] > prices[i + 1] &&
        prices[i] > prices[i + 2]
      ) {
        localMaxima.push(i)
      }
    }

    // Need at least 2 local maxima
    if (localMaxima.length < 2) return false

    // Check if the last two maxima are at similar price levels
    const lastMax = prices[localMaxima[localMaxima.length - 1]]
    const secondLastMax = prices[localMaxima[localMaxima.length - 2]]

    // Calculate the percentage difference
    const priceDiff = Math.abs(lastMax - secondLastMax) / lastMax

    // If the difference is less than 2%, consider it a double top
    return priceDiff < 0.02
  }

  // Helper function to check for double bottom pattern
  const checkDoubleBottom = (prices: number[]): boolean => {
    if (prices.length < 10) return false

    // Find local minima
    const localMinima: number[] = []
    for (let i = 2; i < prices.length - 2; i++) {
      if (
        prices[i] < prices[i - 1] &&
        prices[i] < prices[i - 2] &&
        prices[i] < prices[i + 1] &&
        prices[i] < prices[i + 2]
      ) {
        localMinima.push(i)
      }
    }

    // Need at least 2 local minima
    if (localMinima.length < 2) return false

    // Check if the last two minima are at similar price levels
    const lastMin = prices[localMinima[localMinima.length - 1]]
    const secondLastMin = prices[localMinima[localMinima.length - 2]]

    // Calculate the percentage difference
    const priceDiff = Math.abs(lastMin - secondLastMin) / lastMin

    // If the difference is less than 2%, consider it a double bottom
    return priceDiff < 0.02
  }

  // Function to detect continuation patterns
  const detectContinuationPatterns = (prices: number[], patterns: Pattern[]) => {
    // Need at least 15 prices for continuation pattern analysis
    if (prices.length < 15) return

    // Get the last 30 prices or all if less than 30
    const recentPrices = prices.slice(-Math.min(30, prices.length))

    // Check for flag pattern (short-term consolidation in an uptrend)
    const isFlag = checkFlag(recentPrices)
    if (isFlag) {
      patterns.push({
        id: `continuation-flag-${Date.now()}`,
        name: "Bull Flag Pattern",
        description: "Short-term consolidation in an uptrend, likely to continue upward",
        confidence: 75,
        type: "continuation",
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        action: "Potential continuation of uptrend",
        timeDetected: new Date(),
      })
    }

    // Check for pennant pattern (symmetrical triangle in a trend)
    const isPennant = checkPennant(recentPrices)
    if (isPennant) {
      patterns.push({
        id: `continuation-pennant-${Date.now()}`,
        name: "Pennant Pattern",
        description: "Converging price movement after a strong trend, likely to continue in the same direction",
        confidence: 70,
        type: "continuation",
        icon: <ArrowRight className="h-5 w-5 text-blue-500" />,
        action: "Watch for breakout in the trend direction",
        timeDetected: new Date(),
      })
    }
  }

  // Helper function to check for flag pattern
  const checkFlag = (prices: number[]): boolean => {
    if (prices.length < 15) return false

    // Check for a strong uptrend in the first half
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2))
    const secondHalf = prices.slice(Math.floor(prices.length / 2))

    // Calculate the trend in the first half
    let upCount = 0
    for (let i = 1; i < firstHalf.length; i++) {
      if (firstHalf[i] > firstHalf[i - 1]) upCount++
    }

    const upRatio = upCount / (firstHalf.length - 1)

    // Check for consolidation in the second half
    const secondHalfMax = Math.max(...secondHalf)
    const secondHalfMin = Math.min(...secondHalf)
    const secondHalfRange = secondHalfMax - secondHalfMin
    const secondHalfAvg = secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length
    const secondHalfVolatility = secondHalfRange / secondHalfAvg

    // If there was a strong uptrend followed by low volatility, consider it a flag
    return upRatio > 0.7 && secondHalfVolatility < 0.015
  }

  // Helper function to check for pennant pattern
  const checkPennant = (prices: number[]): boolean => {
    if (prices.length < 15) return false

    // Check for a strong move in the first third
    const firstThird = prices.slice(0, Math.floor(prices.length / 3))
    const lastTwoThirds = prices.slice(Math.floor(prices.length / 3))

    // Calculate the range of the first third
    const firstThirdMax = Math.max(...firstThird)
    const firstThirdMin = Math.min(...firstThird)
    const firstThirdRange = firstThirdMax - firstThirdMin

    // Check for converging highs and lows in the last two thirds
    const highs: number[] = []
    const lows: number[] = []

    for (let i = 5; i < lastTwoThirds.length; i += 5) {
      const segment = lastTwoThirds.slice(i - 5, i)
      highs.push(Math.max(...segment))
      lows.push(Math.min(...segment))
    }

    // Need at least 2 highs and lows
    if (highs.length < 2 || lows.length < 2) return false

    // Check if highs are decreasing and lows are increasing
    const highsDecreasing = highs[highs.length - 1] < highs[0]
    const lowsIncreasing = lows[lows.length - 1] > lows[0]

    // If there was a strong move followed by converging highs and lows, consider it a pennant
    return firstThirdRange > 0 && highsDecreasing && lowsIncreasing
  }

  // Function to detect statistical patterns
  const detectStatisticalPatterns = (digits: number[], patterns: Pattern[]) => {
    // Need at least 20 digits for statistical analysis
    if (digits.length < 20) return

    // Calculate expected frequency for each digit (10%)
    const expectedFrequency = digits.length * 0.1

    // Count occurrences of each digit
    const digitCounts = Array(10).fill(0)
    digits.forEach((digit) => {
      digitCounts[digit]++
    })

    // Check for significant deviations from expected frequency
    digitCounts.forEach((count, digit) => {
      const deviation = Math.abs(count - expectedFrequency) / expectedFrequency

      // If deviation is more than 50%, consider it significant
      if (deviation > 0.5) {
        const isOverrepresented = count > expectedFrequency

        patterns.push({
          id: `statistical-anomaly-${digit}-${Date.now()}`,
          name: `Digit ${digit} Anomaly`,
          description: `Digit ${digit} appears ${isOverrepresented ? "more" : "less"} frequently than expected (${Math.round(deviation * 100)}% deviation)`,
          confidence: Math.min(deviation * 100, 90),
          type: "statistical",
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
          action: isOverrepresented ? `Consider "Matches ${digit}" positions` : `Avoid "Matches ${digit}" positions`,
          timeDetected: new Date(),
        })
      }
    })
  }

  // Function to detect Even/Odd patterns and return a recommendation
  const detectEvenOddPatterns = (digits: number[], patterns: Pattern[]): Recommendation | null => {
    // Need at least 20 digits for pattern analysis
    if (digits.length < 20) return null

    // Get the last 30 digits or all if less than 30
    const recentDigits = digits.slice(-Math.min(30, digits.length))

    // Count even and odd digits
    const evenCount = recentDigits.filter((digit) => digit % 2 === 0).length
    const oddCount = recentDigits.length - evenCount

    // Calculate percentages
    const evenPercentage = (evenCount / recentDigits.length) * 100
    const oddPercentage = (oddCount / recentDigits.length) * 100

    // Check for significant bias
    if (Math.abs(evenPercentage - 50) > 10) {
      const isEvenBias = evenPercentage > oddPercentage
      patterns.push({
        id: `even-odd-bias-${Date.now()}`,
        name: `${isEvenBias ? "Even" : "Odd"} Digit Bias`,
        description: `${isEvenBias ? "Even" : "Odd"} digits appear ${Math.round(isEvenBias ? evenPercentage : oddPercentage)}% of the time`,
        confidence: Math.min(Math.abs(evenPercentage - 50) * 2, 90),
        type: "statistical",
        strategyType: "even-odd",
        icon: <Divide className="h-5 w-5 text-purple-500" />,
        action: `Play "${isEvenBias ? "Even" : "Odd"}"`,
        recommendation: {
          strategy: "even-odd",
          value: isEvenBias ? "Even" : "Odd",
          confidence: Math.min(Math.abs(evenPercentage - 50) * 2, 90),
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "even-odd",
        value: isEvenBias ? "Even" : "Odd",
        confidence: Math.min(Math.abs(evenPercentage - 50) * 2, 90),
        description: `${isEvenBias ? "Even" : "Odd"} digits appear ${Math.round(isEvenBias ? evenPercentage : oddPercentage)}% of the time`,
        lastUpdated: new Date(),
      }
    }

    // Check for alternating patterns (even-odd-even or odd-even-odd)
    let alternatingCount = 0
    for (let i = 2; i < recentDigits.length; i++) {
      const isCurrentEven = recentDigits[i] % 2 === 0
      const isPrevEven = recentDigits[i - 1] % 2 === 0
      const isPrevPrevEven = recentDigits[i - 2] % 2 === 0

      if ((isCurrentEven && !isPrevEven && isPrevPrevEven) || (!isCurrentEven && isPrevEven && !isPrevPrevEven)) {
        alternatingCount++
      }
    }

    const alternatingPercentage = (alternatingCount / (recentDigits.length - 2)) * 100
    if (alternatingPercentage > 60) {
      // If the last digit is even, predict odd next, and vice versa
      const lastDigit = recentDigits[recentDigits.length - 1]
      const isLastDigitEven = lastDigit % 2 === 0
      const prediction = isLastDigitEven ? "Odd" : "Even"

      patterns.push({
        id: `even-odd-alternating-${Date.now()}`,
        name: "Even-Odd Alternating Pattern",
        description: `Strong alternating pattern between even and odd digits (${Math.round(alternatingPercentage)}%)`,
        confidence: Math.min(alternatingPercentage, 85),
        type: "digit",
        strategyType: "even-odd",
        icon: <RefreshCcw className="h-5 w-5 text-purple-500" />,
        action: `Play "${prediction}"`,
        recommendation: {
          strategy: "even-odd",
          value: prediction,
          confidence: Math.min(alternatingPercentage, 85),
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "even-odd",
        value: prediction,
        confidence: Math.min(alternatingPercentage, 85),
        description: `Strong alternating pattern between even and odd digits (${Math.round(alternatingPercentage)}%)`,
        lastUpdated: new Date(),
      }
    }

    // Check for streaks
    let currentStreak = 1
    let maxStreak = 1
    let maxStreakType = recentDigits[0] % 2 === 0 ? "even" : "odd"
    let currentStreakType = recentDigits[0] % 2 === 0 ? "even" : "odd"

    for (let i = 1; i < recentDigits.length; i++) {
      const isEven = recentDigits[i] % 2 === 0
      const currentType = isEven ? "even" : "odd"

      if (currentType === currentStreakType) {
        currentStreak++
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak
          maxStreakType = currentType
        }
      } else {
        currentStreak = 1
        currentStreakType = currentType
      }
    }

    // Current streak at the end of the sequence
    const lastDigitType = recentDigits[recentDigits.length - 1] % 2 === 0 ? "even" : "odd"
    let lastStreakLength = 1
    for (let i = recentDigits.length - 2; i >= 0; i--) {
      const digitType = recentDigits[i] % 2 === 0 ? "even" : "odd"
      if (digitType === lastDigitType) {
        lastStreakLength++
      } else {
        break
      }
    }

    if (lastStreakLength >= 3) {
      // After a long streak, predict the opposite
      const prediction = lastDigitType === "even" ? "Odd" : "Even"
      const confidence = Math.min(lastStreakLength * 10, 80)

      patterns.push({
        id: `even-odd-streak-${Date.now()}`,
        name: `${lastDigitType.charAt(0).toUpperCase() + lastDigitType.slice(1)} Digit Streak`,
        description: `Current streak of ${lastStreakLength} consecutive ${lastDigitType} digits`,
        confidence,
        type: "digit",
        strategyType: "even-odd",
        icon: <TrendingUp className="h-5 w-5 text-purple-500" />,
        action: `Play "${prediction}" (streak break)`,
        recommendation: {
          strategy: "even-odd",
          value: prediction,
          confidence,
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "even-odd",
        value: prediction,
        confidence,
        description: `Current streak of ${lastStreakLength} consecutive ${lastDigitType} digits`,
        lastUpdated: new Date(),
      }
    }

    // If no strong pattern is detected, return the bias (even if it's weak)
    const isEvenBias = evenPercentage >= oddPercentage
    const confidence = Math.max(Math.abs(evenPercentage - 50) * 1.5, 50) // Minimum 50% confidence

    return {
      strategy: "even-odd",
      value: isEvenBias ? "Even" : "Odd",
      confidence,
      description: `Slight bias towards ${isEvenBias ? "even" : "odd"} digits (${Math.round(isEvenBias ? evenPercentage : oddPercentage)}%)`,
      lastUpdated: new Date(),
    }
  }

  // Function to detect Over/Under patterns and return a recommendation
  const detectOverUnderPatterns = (digits: number[], patterns: Pattern[]): Recommendation | null => {
    // Need at least 20 digits for pattern analysis
    if (digits.length < 20) return null

    // Get the last 30 digits or all if less than 30
    const recentDigits = digits.slice(-Math.min(30, digits.length))

    // Count over (5-9) and under (0-4) digits
    const overDigits = [5, 6, 7, 8, 9]
    const overCount = recentDigits.filter((digit) => overDigits.includes(digit)).length
    const underCount = recentDigits.length - overCount

    // Calculate percentages
    const overPercentage = (overCount / recentDigits.length) * 100
    const underPercentage = (underCount / recentDigits.length) * 100

    // Check for significant bias
    if (Math.abs(overPercentage - 50) > 10) {
      const isOverBias = overPercentage > underPercentage
      patterns.push({
        id: `over-under-bias-${Date.now()}`,
        name: `${isOverBias ? "Over" : "Under"} Digit Bias`,
        description: `${isOverBias ? "Over (5-9)" : "Under (0-4)"} digits appear ${Math.round(isOverBias ? overPercentage : underPercentage)}% of the time`,
        confidence: Math.min(Math.abs(overPercentage - 50) * 2, 90),
        type: "statistical",
        strategyType: "over-under",
        icon: <ArrowUpDown className="h-5 w-5 text-blue-500" />,
        action: `Play "${isOverBias ? "Over" : "Under"}"`,
        recommendation: {
          strategy: "over-under",
          value: isOverBias ? "Over" : "Under",
          confidence: Math.min(Math.abs(overPercentage - 50) * 2, 90),
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "over-under",
        value: isOverBias ? "Over" : "Under",
        confidence: Math.min(Math.abs(overPercentage - 50) * 2, 90),
        description: `${isOverBias ? "Over (5-9)" : "Under (0-4)"} digits appear ${Math.round(isOverBias ? overPercentage : underPercentage)}% of the time`,
        lastUpdated: new Date(),
      }
    }

    // Check for alternating patterns (over-under-over or under-over-under)
    let alternatingCount = 0
    for (let i = 2; i < recentDigits.length; i++) {
      const isCurrentOver = recentDigits[i] >= 5
      const isPrevOver = recentDigits[i - 1] >= 5
      const isPrevPrevOver = recentDigits[i - 2] >= 5

      if ((isCurrentOver && !isPrevOver && isPrevPrevOver) || (!isCurrentOver && isPrevOver && !isPrevPrevOver)) {
        alternatingCount++
      }
    }

    const alternatingPercentage = (alternatingCount / (recentDigits.length - 2)) * 100
    if (alternatingPercentage > 60) {
      // If the last digit is over, predict under next, and vice versa
      const lastDigit = recentDigits[recentDigits.length - 1]
      const isLastDigitOver = lastDigit >= 5
      const prediction = isLastDigitOver ? "Under" : "Over"

      patterns.push({
        id: `over-under-alternating-${Date.now()}`,
        name: "Over-Under Alternating Pattern",
        description: `Strong alternating pattern between over and under digits (${Math.round(alternatingPercentage)}%)`,
        confidence: Math.min(alternatingPercentage, 85),
        type: "digit",
        strategyType: "over-under",
        icon: <RefreshCcw className="h-5 w-5 text-blue-500" />,
        action: `Play "${prediction}"`,
        recommendation: {
          strategy: "over-under",
          value: prediction,
          confidence: Math.min(alternatingPercentage, 85),
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "over-under",
        value: prediction,
        confidence: Math.min(alternatingPercentage, 85),
        description: `Strong alternating pattern between over and under digits (${Math.round(alternatingPercentage)}%)`,
        lastUpdated: new Date(),
      }
    }

    // Check for streaks
    let currentStreak = 1
    let maxStreak = 1
    let maxStreakType = recentDigits[0] >= 5 ? "over" : "under"
    let currentStreakType = recentDigits[0] >= 5 ? "over" : "under"

    for (let i = 1; i < recentDigits.length; i++) {
      const isOver = recentDigits[i] >= 5
      const currentType = isOver ? "over" : "under"

      if (currentType === currentStreakType) {
        currentStreak++
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak
          maxStreakType = currentType
        }
      } else {
        currentStreak = 1
        currentStreakType = currentType
      }
    }

    // Current streak at the end of the sequence
    const lastDigitType = recentDigits[recentDigits.length - 1] >= 5 ? "over" : "under"
    let lastStreakLength = 1
    for (let i = recentDigits.length - 2; i >= 0; i--) {
      const digitType = recentDigits[i] >= 5 ? "over" : "under"
      if (digitType === lastDigitType) {
        lastStreakLength++
      } else {
        break
      }
    }

    if (lastStreakLength >= 3) {
      // After a long streak, predict the opposite
      const prediction = lastDigitType === "over" ? "Under" : "Over"
      const confidence = Math.min(lastStreakLength * 10, 80)

      patterns.push({
        id: `over-under-streak-${Date.now()}`,
        name: `${lastDigitType.charAt(0).toUpperCase() + lastDigitType.slice(1)} Digit Streak`,
        description: `Current streak of ${lastStreakLength} consecutive ${lastDigitType} digits`,
        confidence,
        type: "digit",
        strategyType: "over-under",
        icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
        action: `Play "${prediction}" (streak break)`,
        recommendation: {
          strategy: "over-under",
          value: prediction,
          confidence,
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "over-under",
        value: prediction,
        confidence,
        description: `Current streak of ${lastStreakLength} consecutive ${lastDigitType} digits`,
        lastUpdated: new Date(),
      }
    }

    // If no strong pattern is detected, return the bias (even if it's weak)
    const isOverBias = overPercentage >= underPercentage
    const confidence = Math.max(Math.abs(overPercentage - 50) * 1.5, 50) // Minimum 50% confidence

    return {
      strategy: "over-under",
      value: isOverBias ? "Over" : "Under",
      confidence,
      description: `Slight bias towards ${isOverBias ? "over" : "under"} digits (${Math.round(isOverBias ? overPercentage : underPercentage)}%)`,
      lastUpdated: new Date(),
    }
  }

  // Function to detect Matches patterns and return a recommendation
  const detectMatchesPatterns = (digits: number[], patterns: Pattern[]): Recommendation | null => {
    // Need at least 20 digits for pattern analysis
    if (digits.length < 20) return null

    // Get the last 30 digits or all if less than 30
    const recentDigits = digits.slice(-Math.min(30, digits.length))

    // Get the last digit
    const lastDigit = recentDigits[recentDigits.length - 1]

    // Count occurrences of each digit
    const digitCounts = Array(10).fill(0)
    recentDigits.forEach((digit) => {
      digitCounts[digit]++
    })

    // Find the most and least frequent digits
    const maxCount = Math.max(...digitCounts)
    const mostFrequentDigit = digitCounts.findIndex((count) => count === maxCount)

    // Calculate percentages
    const mostFrequentPercentage = (maxCount / recentDigits.length) * 100

    // Check for significant bias towards a specific digit
    if (mostFrequentPercentage > 15) {
      // More than 15% is significant for a single digit (expected is 10%)
      patterns.push({
        id: `matches-frequent-${Date.now()}`,
        name: `Digit ${mostFrequentDigit} Dominance`,
        description: `Digit ${mostFrequentDigit} appears ${Math.round(mostFrequentPercentage)}% of the time (expected: 10%)`,
        confidence: Math.min(mostFrequentPercentage * 3, 90),
        type: "statistical",
        strategyType: "matches",
        icon: <Hash className="h-5 w-5 text-green-500" />,
        action: `Play "Matches ${mostFrequentDigit}"`,
        recommendation: {
          strategy: "matches",
          value: mostFrequentDigit,
          confidence: Math.min(mostFrequentPercentage * 3, 90),
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "matches",
        value: mostFrequentDigit,
        confidence: Math.min(mostFrequentPercentage * 3, 90),
        description: `Digit ${mostFrequentDigit} appears ${Math.round(mostFrequentPercentage)}% of the time`,
        lastUpdated: new Date(),
      }
    }

    // Check for repeating digits
    let repeatCount = 0
    for (let i = 1; i < recentDigits.length; i++) {
      if (recentDigits[i] === recentDigits[i - 1]) {
        repeatCount++
      }
    }

    const repeatPercentage = (repeatCount / (recentDigits.length - 1)) * 100
    if (repeatPercentage > 15) {
      // More than 15% is significant (expected is around 10%)
      patterns.push({
        id: `matches-repeats-${Date.now()}`,
        name: "Digit Repetition Pattern",
        description: `Consecutive digit repetitions occur ${Math.round(repeatPercentage)}% of the time`,
        confidence: Math.min(repeatPercentage * 3, 85),
        type: "digit",
        strategyType: "matches",
        icon: <Repeat className="h-5 w-5 text-green-500" />,
        action: `Play "Matches ${lastDigit}"`,
        recommendation: {
          strategy: "matches",
          value: lastDigit,
          confidence: Math.min(repeatPercentage * 3, 85),
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "matches",
        value: lastDigit,
        confidence: Math.min(repeatPercentage * 3, 85),
        description: `Consecutive digit repetitions occur ${Math.round(repeatPercentage)}% of the time`,
        lastUpdated: new Date(),
      }
    }

    // Check for digit pairs (specific digits that tend to follow each other)
    const pairCounts = Array(10)
      .fill(0)
      .map(() => Array(10).fill(0))
    for (let i = 1; i < recentDigits.length; i++) {
      pairCounts[recentDigits[i - 1]][recentDigits[i]]++
    }

    // Find the most likely next digit based on the last digit
    const followingDigitCounts = pairCounts[lastDigit]
    const maxFollowingCount = Math.max(...followingDigitCounts)
    const mostLikelyNextDigit = followingDigitCounts.findIndex((count) => count === maxFollowingCount)

    // Calculate the percentage of times this digit follows the last digit
    const totalFollowingLastDigit = followingDigitCounts.reduce((sum, count) => sum + count, 0)
    const followingPercentage = totalFollowingLastDigit > 0 ? (maxFollowingCount / totalFollowingLastDigit) * 100 : 0

    if (followingPercentage > 20) {
      // More than 20% is significant (expected is 10%)
      patterns.push({
        id: `matches-pair-${Date.now()}`,
        name: `Digit Pair ${lastDigit}→${mostLikelyNextDigit}`,
        description: `Digit ${mostLikelyNextDigit} follows ${lastDigit} ${Math.round(followingPercentage)}% of the time`,
        confidence: Math.min(followingPercentage * 2.5, 80),
        type: "digit",
        strategyType: "matches",
        icon: <ArrowRight className="h-5 w-5 text-green-500" />,
        action: `Play "Matches ${mostLikelyNextDigit}"`,
        recommendation: {
          strategy: "matches",
          value: mostLikelyNextDigit,
          confidence: Math.min(followingPercentage * 2.5, 80),
        },
        timeDetected: new Date(),
      })

      return {
        strategy: "matches",
        value: mostLikelyNextDigit,
        confidence: Math.min(followingPercentage * 2.5, 80),
        description: `Digit ${mostLikelyNextDigit} follows ${lastDigit} ${Math.round(followingPercentage)}% of the time`,
        lastUpdated: new Date(),
      }
    }

    // If no strong pattern is detected, return the most frequent digit with lower confidence
    return {
      strategy: "matches",
      value: mostFrequentDigit,
      confidence: Math.max(mostFrequentPercentage * 2, 50), // Minimum 50% confidence
      description: `Digit ${mostFrequentDigit} appears slightly more often (${Math.round(mostFrequentPercentage)}%)`,
      lastUpdated: new Date(),
    }
  }

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Get confidence text color
  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-500"
    if (confidence >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  // Get strategy icon
  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case "even-odd":
        return <Divide className="h-5 w-5" />
      case "over-under":
        return <ArrowUpDown className="h-5 w-5" />
      case "matches":
        return <Hash className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  // Get strategy color
  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "even-odd":
        return "text-purple-500"
      case "over-under":
        return "text-blue-500"
      case "matches":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  // Get risk level based on confidence
  const getRiskLevel = (confidence: number): "LOW" | "MEDIUM" | "HIGH" => {
    if (confidence >= 80) return "LOW"
    if (confidence >= 65) return "MEDIUM"
    return "HIGH"
  }

  // Get action text for trading
  const getActionText = (strategy: string, value: string | number): string => {
    if (strategy === "even-odd") {
      return `TRADE ${value}`.toUpperCase()
    } else if (strategy === "over-under") {
      return `TRADE ${value}`.toUpperCase()
    } else {
      return `TRADE MATCHES ${value}`
    }
  }

  // Get confidence description
  const getConfidenceDescription = (confidence: number): string => {
    if (confidence >= 85) return "Very Strong"
    if (confidence >= 75) return "Strong"
    if (confidence >= 65) return "Moderate"
    if (confidence >= 55) return "Weak"
    return "Very Weak"
  }

  // Filter patterns based on active tab
  const filteredPatterns =
    activeTab === "all"
      ? patterns
      : activeTab === "even-odd"
        ? patterns.filter((pattern) => pattern.strategyType === "even-odd")
        : activeTab === "over-under"
          ? patterns.filter((pattern) => pattern.strategyType === "over-under")
          : activeTab === "matches"
            ? patterns.filter((pattern) => pattern.strategyType === "matches")
            : patterns.filter((pattern) => pattern.type === activeTab)

  if (!mounted) return null

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-500 transform",
        animateIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        isDarkTheme
          ? "bg-gray-900/60 border-blue-500/20 hover:border-blue-500/40"
          : "bg-white/90 border-blue-300/30 hover:border-blue-500/40",
        "hover:shadow-lg hover:shadow-blue-500/10",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Advanced Trading Patterns
            </span>
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
          </CardTitle>
          {isConnected && (
            <div className="flex items-center text-xs text-green-500 ml-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              <span>Live Data</span>
            </div>
          )}
        </div>

        {/* Last digit indicator */}
        {lastDigit !== null && (
          <div className={cn("mt-2 flex items-center justify-between", pulseAnimation ? "animate-pulse" : "")}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Last Digit:</span>
              <span className="text-lg font-bold">{lastDigit}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({lastDigit % 2 === 0 ? "Even" : "Odd"}, {lastDigit >= 5 ? "Over" : "Under"})
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Updated: {formatTime(lastUpdateTime)}</span>
            </div>
          </div>
        )}

        {/* Trading Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Trading Recommendations</h3>
              {isConnected && (
                <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                  Live Analysis
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => {
                const strategyIcon = getStrategyIcon(rec.strategy)
                const strategyColor = getStrategyColor(rec.strategy)
                const confidenceColor = getConfidenceTextColor(rec.confidence)
                const riskLevel = getRiskLevel(rec.confidence)
                const actionText = getActionText(rec.strategy, rec.value)

                return (
                  <div
                    key={rec.strategy}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-300",
                      rec.confidence >= 80
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : rec.confidence >= 65
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                          : "border-gray-300 bg-gray-50 dark:bg-gray-800/50",
                      "hover:shadow-lg transform hover:scale-[1.02]",
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            rec.confidence >= 80
                              ? "bg-green-100 dark:bg-green-900/40"
                              : rec.confidence >= 65
                                ? "bg-yellow-100 dark:bg-yellow-900/40"
                                : "bg-gray-100 dark:bg-gray-700",
                          )}
                        >
                          <div className={strategyColor}>{strategyIcon}</div>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">
                            {rec.strategy === "even-odd" ? "EVEN/ODD" : "OVER/UNDER"}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedVolatility !== "all"
                              ? volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]?.name
                              : "All Volatilities"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-2xl font-bold", confidenceColor)}>{Math.round(rec.confidence)}%</div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            riskLevel === "LOW"
                              ? "border-green-500 text-green-500"
                              : riskLevel === "MEDIUM"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-red-500 text-red-500",
                          )}
                        >
                          {riskLevel} RISK
                        </Badge>
                      </div>
                    </div>

                    {/* Main Recommendation */}
                    <div className="mb-3">
                      <div
                        className={cn(
                          "text-center py-3 px-4 rounded-lg font-bold text-xl",
                          rec.confidence >= 80
                            ? "bg-green-500 text-white"
                            : rec.confidence >= 65
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-500 text-white",
                        )}
                      >
                        {actionText}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Strategy:</span>
                        <span className="font-medium">
                          {typeof rec.value === "number" ? `Matches ${rec.value}` : rec.value}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                        <span className={cn("font-medium", confidenceColor)}>
                          {getConfidenceDescription(rec.confidence)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                        <span className="font-medium">{formatTime(rec.lastUpdated)}</span>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="mt-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Analysis:</strong> {rec.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex gap-2">
                      <button
                        className={cn(
                          "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                          rec.confidence >= 75
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
                        )}
                      >
                        Trade Now
                      </button>
                      <button className="px-3 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800">
                        Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Overall Market Sentiment */}
            {recommendations.length > 0 && (
              <div className="mt-4 p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">Market Sentiment</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Best Strategy:</span>
                    <span className="ml-1 font-medium">
                      {recommendations.reduce((best, current) =>
                        current.confidence > best.confidence ? current : best,
                      ).strategy === "even-odd"
                        ? "Even/Odd"
                        : "Over/Under"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Avg Confidence:</span>
                    <span className="ml-1 font-medium">
                      {Math.round(
                        recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length,
                      )}
                      %
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Patterns Found:</span>
                    <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">{patterns.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                    <span className="ml-1 font-medium">{formatTime(lastUpdateTime)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Volatility Selection */}
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className={cn("h-4 w-4", isDarkTheme ? "text-blue-400" : "text-blue-600")} />
            <span className="text-sm font-medium">Volatility Filter:</span>
          </div>
          <div className="flex-1">
            <Select value={selectedVolatility} onValueChange={setSelectedVolatility}>
              <SelectTrigger
                className={cn(
                  "h-8 text-sm",
                  isDarkTheme
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500/50"
                    : "bg-white border-gray-300 hover:border-blue-500/50",
                )}
              >
                <SelectValue placeholder="Select volatility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Volatilities</SelectItem>
                {Object.entries(volatilitySymbols).map(([symbol, info]) => (
                  <SelectItem key={symbol} value={symbol}>
                    {info.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Volatility-Specific Insights */}
        {selectedVolatility !== "all" && (
          <div className="mt-3 p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]?.name} Analysis
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Volatility Level:</span>
                <span className="ml-1 font-medium">
                  {volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]?.code}%
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                <span className="ml-1 font-medium">
                  {volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]?.speed}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Base Value:</span>
                <span className="ml-1 font-medium">
                  {volatilitySymbols[selectedVolatility as keyof typeof volatilitySymbols]?.baseValue}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Patterns Found:</span>
                <span className="ml-1 font-medium text-blue-600 dark:text-blue-400">{patterns.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Pattern type tabs */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge
            variant={activeTab === "all" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              activeTab === "all" ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-blue-100 dark:hover:bg-blue-900/30",
            )}
            onClick={() => setActiveTab("all")}
          >
            All
          </Badge>
          <Badge
            variant={activeTab === "even-odd" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              activeTab === "even-odd"
                ? "bg-purple-500 hover:bg-purple-600"
                : "hover:bg-purple-100 dark:hover:bg-purple-900/30",
            )}
            onClick={() => setActiveTab("even-odd")}
          >
            Even/Odd
          </Badge>
          <Badge
            variant={activeTab === "over-under" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              activeTab === "over-under"
                ? "bg-blue-500 hover:bg-blue-600"
                : "hover:bg-blue-100 dark:hover:bg-blue-900/30",
            )}
            onClick={() => setActiveTab("over-under")}
          >
            Over/Under
          </Badge>
          <Badge
            variant={activeTab === "matches" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              activeTab === "matches"
                ? "bg-green-500 hover:bg-green-600"
                : "hover:bg-green-100 dark:hover:bg-green-900/30",
            )}
            onClick={() => setActiveTab("matches")}
          >
            Matches
          </Badge>
          <Badge
            variant={activeTab === "trend" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              activeTab === "trend"
                ? "bg-green-500 hover:bg-green-600"
                : "hover:bg-green-100 dark:hover:bg-green-900/30",
            )}
            onClick={() => setActiveTab("trend")}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Trend
          </Badge>
          <Badge
            variant={activeTab === "digit" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              activeTab === "digit"
                ? "bg-purple-500 hover:bg-purple-600"
                : "hover:bg-purple-100 dark:hover:bg-purple-900/30",
            )}
            onClick={() => setActiveTab("digit")}
          >
            <Repeat className="h-3 w-3 mr-1" />
            Digit
          </Badge>
          <Badge
            variant={activeTab === "statistical" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              activeTab === "statistical"
                ? "bg-cyan-500 hover:bg-cyan-600"
                : "hover:bg-cyan-100 dark:hover:bg-cyan-900/30",
            )}
            onClick={() => setActiveTab("statistical")}
          >
            <BarChart2 className="h-3 w-3 mr-1" />
            Statistical
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {isLoading && patterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">Analyzing trading patterns...</p>
          </div>
        ) : filteredPatterns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-2">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No {activeTab !== "all" ? activeTab : ""} patterns detected yet.
              <br />
              Patterns will appear as they are identified in the data.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {filteredPatterns.map((pattern) => (
              <div
                key={pattern.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-300",
                  isDarkTheme
                    ? "bg-gray-800/60 border-gray-700 hover:border-blue-500/50"
                    : "bg-gray-50 border-gray-200 hover:border-blue-500/50",
                  "hover:shadow-md",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full", isDarkTheme ? "bg-gray-700" : "bg-gray-100")}>
                      {pattern.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        {pattern.name}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-normal",
                            pattern.type === "trend"
                              ? "border-green-500 text-green-500"
                              : pattern.type === "reversal"
                                ? "border-red-500 text-red-500"
                                : pattern.type === "continuation"
                                  ? "border-amber-500 text-amber-500"
                                  : pattern.type === "digit"
                                    ? "border-purple-500 text-purple-500"
                                    : "border-cyan-500 text-cyan-500",
                          )}
                        >
                          {pattern.type}
                        </Badge>
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pattern.description}</p>
                      {pattern.action && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
                          <ArrowRight className="h-3 w-3" />
                          <span>{pattern.action}</span>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">{formatTime(pattern.timeDetected)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">{Math.round(pattern.confidence)}%</span>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            pattern.confidence >= 80 ? "#10b981" : pattern.confidence >= 60 ? "#f59e0b" : "#ef4444",
                        }}
                      ></div>
                    </div>
                    <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          pattern.confidence >= 80
                            ? "bg-green-500"
                            : pattern.confidence >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500",
                        )}
                        style={{ width: `${pattern.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
