"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

interface CandleData {
  open: number
  high: number
  low: number
  close: number
  timestamp: number
}

interface CandlestickChartProps {
  symbol: string
  height?: number
}

export default function CandlestickChart({ symbol, height = 400 }: CandlestickChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [candleData, setCandleData] = useState<CandleData[]>([])

  // Generate sample candlestick data
  useEffect(() => {
    const generateCandleData = () => {
      const data: CandleData[] = []
      let basePrice = 683.31

      for (let i = 0; i < 50; i++) {
        const open = basePrice + (Math.random() - 0.5) * 10
        const close = open + (Math.random() - 0.5) * 15
        const high = Math.max(open, close) + Math.random() * 8
        const low = Math.min(open, close) - Math.random() * 8

        data.push({
          open,
          high,
          low,
          close,
          timestamp: Date.now() - (50 - i) * 60000, // 1 minute intervals
        })

        basePrice = close
      }

      setCandleData(data)
    }

    generateCandleData()
    const interval = setInterval(generateCandleData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [symbol])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || candleData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isDark = theme === "dark"

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height)

    // Colors
    const bullishColor = "#22c55e"
    const bearishColor = "#ef4444"
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    const textColor = isDark ? "#e5e7eb" : "#374151"

    // Padding
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Calculate min/max values
    const allValues = candleData.flatMap((d) => [d.high, d.low])
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const valueRange = maxValue - minValue || 1

    // Draw grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()

      // Y-axis labels
      const value = maxValue - (valueRange / 5) * i
      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(value.toFixed(2), padding.left - 10, y + 4)
    }

    // Draw candlesticks
    const candleWidth = Math.max(2, chartWidth / candleData.length - 2)

    candleData.forEach((candle, index) => {
      const x = padding.left + (chartWidth / candleData.length) * index + chartWidth / candleData.length / 2

      const openY = padding.top + chartHeight - ((candle.open - minValue) / valueRange) * chartHeight
      const closeY = padding.top + chartHeight - ((candle.close - minValue) / valueRange) * chartHeight
      const highY = padding.top + chartHeight - ((candle.high - minValue) / valueRange) * chartHeight
      const lowY = padding.top + chartHeight - ((candle.low - minValue) / valueRange) * chartHeight

      const isBullish = candle.close > candle.open
      const color = isBullish ? bullishColor : bearishColor

      // Draw wick (high-low line)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // Draw body (open-close rectangle)
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY)

      ctx.fillStyle = isBullish ? color : color
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight || 1)

      if (!isBullish) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight || 1)
      }
    })

    // Chart title
    ctx.fillStyle = textColor
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`${symbol} - Candlestick Chart`, padding.left, 15)

    // Legend
    ctx.font = "12px sans-serif"
    ctx.fillStyle = bullishColor
    ctx.fillText("● Bullish", rect.width - 120, 15)
    ctx.fillStyle = bearishColor
    ctx.fillText("● Bearish", rect.width - 60, 15)
  }, [candleData, symbol, height, theme])

  return (
    <div className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ height }} />
    </div>
  )
}
