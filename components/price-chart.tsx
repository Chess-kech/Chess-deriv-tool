"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export interface PriceChartProps {
  symbol: string
  data: number[]
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
}

export default function PriceChart({
  symbol,
  data = [],
  height = 350,
  showGrid = true,
  showTooltip = true,
}: PriceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [priceHistory, setPriceHistory] = useState<number[]>([])
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceDirection, setPriceDirection] = useState<"up" | "down" | null>(null)
  const animationRef = useRef<number | null>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Initialize with some data or use provided data
  useEffect(() => {
    if (data.length > 0) {
      setPriceHistory(data)
      setCurrentPrice(data[data.length - 1])
      setIsLoading(false)
    } else {
      // Generate some random price data if none provided
      const basePrice = 500 + Math.random() * 500
      const newPrices = Array.from({ length: 100 }, (_, i) => {
        return basePrice + (Math.random() - 0.5) * 50 * Math.sin(i / 10)
      })
      setPriceHistory(newPrices)
      setCurrentPrice(newPrices[newPrices.length - 1])
      setIsLoading(false)
    }

    // Simulate price updates
    const interval = setInterval(() => {
      setPriceHistory((prev) => {
        if (prev.length === 0) return prev

        const lastPrice = prev[prev.length - 1]
        const change = (Math.random() - 0.5) * 2
        const newPrice = Math.max(100, lastPrice + change)

        // Set price direction for animation
        setPriceDirection(change >= 0 ? "up" : "down")
        setCurrentPrice(newPrice)

        // Keep last 100 points
        const newHistory = [...prev, newPrice]
        return newHistory.slice(-100)
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [data, symbol])

  // Draw chart
  useEffect(() => {
    if (!chartRef.current || priceHistory.length === 0) return

    const canvas = chartRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate min and max for scaling
    const min = Math.min(...priceHistory) * 0.99
    const max = Math.max(...priceHistory) * 1.01
    const range = max - min

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      ctx.lineWidth = 0.5

      // Horizontal grid lines
      for (let i = 0; i < 5; i++) {
        const y = rect.height * (1 - i / 4)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()

        // Price labels
        const price = min + (range * i) / 4
        ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"
        ctx.font = "10px Arial"
        ctx.textAlign = "left"
        ctx.fillText(price.toFixed(2), 5, y - 5)
      }
    }

    // Create gradient for line
    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    gradient.addColorStop(0, isDark ? "rgba(236, 72, 153, 1)" : "rgba(219, 39, 119, 1)")
    gradient.addColorStop(1, isDark ? "rgba(124, 58, 237, 1)" : "rgba(79, 70, 229, 1)")

    // Draw price line
    ctx.strokeStyle = gradient
    ctx.lineWidth = 2
    ctx.beginPath()

    priceHistory.forEach((price, i) => {
      const x = (i / (priceHistory.length - 1)) * rect.width
      const y = rect.height - ((price - min) / range) * rect.height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()

    // Fill area under the line
    const fillGradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    fillGradient.addColorStop(0, isDark ? "rgba(236, 72, 153, 0.2)" : "rgba(219, 39, 119, 0.2)")
    fillGradient.addColorStop(1, isDark ? "rgba(124, 58, 237, 0.05)" : "rgba(79, 70, 229, 0.05)")

    ctx.fillStyle = fillGradient
    ctx.lineTo(rect.width, rect.height)
    ctx.lineTo(0, rect.height)
    ctx.closePath()
    ctx.fill()

    // Draw current price point
    if (priceHistory.length > 0) {
      const lastPrice = priceHistory[priceHistory.length - 1]
      const x = rect.width
      const y = rect.height - ((lastPrice - min) / range) * rect.height

      // Glow effect
      ctx.shadowColor = isDark ? "rgba(236, 72, 153, 0.8)" : "rgba(219, 39, 119, 0.8)"
      ctx.shadowBlur = 10

      // Draw point
      ctx.fillStyle = isDark ? "#ec4899" : "#db2777"
      ctx.beginPath()
      ctx.arc(x - 5, y, 5, 0, Math.PI * 2)
      ctx.fill()

      // Reset shadow
      ctx.shadowBlur = 0
    }

    // Draw symbol name
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "left"
    ctx.fillText(symbol, 10, 20)
  }, [priceHistory, isDark, theme, showGrid])

  return (
    <Card
      className={cn(
        "overflow-hidden relative transition-all duration-300",
        isDark ? "bg-gray-900/60 border-pink-500/20" : "bg-white/90 border-purple-300/30",
        "hover:shadow-lg hover:shadow-pink-500/10",
      )}
    >
      {isLoading ? (
        <div className="p-4 space-y-3">
          <Skeleton className={`h-[${height}px] w-full rounded-md`} />
        </div>
      ) : (
        <div className="relative" style={{ height: `${height}px` }}>
          <canvas ref={chartRef} className="w-full h-full" style={{ height: `${height}px` }} />

          {/* Current price overlay */}
          {currentPrice && showTooltip && (
            <div
              className={cn(
                "absolute top-4 right-4 px-4 py-2 rounded-lg font-mono text-xl font-bold transition-all duration-500",
                priceDirection === "up"
                  ? "bg-green-500/20 text-green-500 dark:text-green-400"
                  : priceDirection === "down"
                    ? "bg-red-500/20 text-red-500 dark:text-red-400"
                    : "bg-gray-500/20 text-gray-700 dark:text-gray-300",
              )}
            >
              {currentPrice.toFixed(2)}
              {priceDirection === "up" && <span className="ml-1 animate-bounce-subtle">↑</span>}
              {priceDirection === "down" && <span className="ml-1 animate-bounce-subtle">↓</span>}
            </div>
          )}

          {/* Watermark */}
          <div className="absolute bottom-2 right-4 text-xs opacity-50">Real Chart</div>
        </div>
      )}
    </Card>
  )
}
