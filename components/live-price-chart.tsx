"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface LivePriceChartProps {
  data: number[]
  symbol: string
  height?: number
}

export default function LivePriceChart({ data, symbol, height = 300 }: LivePriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

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
    const lineColor = isDark ? "#3b82f6" : "#2563eb"
    const fillColor = isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.1)"
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    const textColor = isDark ? "#e5e7eb" : "#374151"

    // Padding
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Calculate min/max values
    const minValue = Math.min(...data)
    const maxValue = Math.max(...data)
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

    // Vertical grid lines
    const gridLines = 6
    for (let i = 0; i <= gridLines; i++) {
      const x = padding.left + (chartWidth / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, padding.top + chartHeight)
      ctx.stroke()
    }

    // Draw price line
    if (data.length > 1) {
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 2
      ctx.beginPath()

      // Create path for line
      const points: { x: number; y: number }[] = []

      data.forEach((price, index) => {
        const x = padding.left + (chartWidth / (data.length - 1)) * index
        const y = padding.top + chartHeight - ((price - minValue) / valueRange) * chartHeight
        points.push({ x, y })

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Fill area under line
      ctx.fillStyle = fillColor
      ctx.beginPath()
      ctx.moveTo(points[0].x, padding.top + chartHeight)
      points.forEach((point) => ctx.lineTo(point.x, point.y))
      ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight)
      ctx.closePath()
      ctx.fill()

      // Draw current price point
      const lastPoint = points[points.length - 1]
      ctx.fillStyle = lineColor
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Current price label
      ctx.fillStyle = isDark ? "#1f2937" : "#ffffff"
      ctx.fillRect(lastPoint.x + 10, lastPoint.y - 12, 60, 24)
      ctx.strokeStyle = lineColor
      ctx.strokeRect(lastPoint.x + 10, lastPoint.y - 12, 60, 24)
      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(data[data.length - 1].toFixed(2), lastPoint.x + 40, lastPoint.y + 4)
    }

    // Chart title
    ctx.fillStyle = textColor
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`${symbol} - Live Price`, padding.left, 15)

    // X-axis label
    ctx.textAlign = "center"
    ctx.fillText("Time", rect.width / 2, height - 10)
  }, [data, symbol, height, theme])

  return (
    <div className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ height }} />
    </div>
  )
}
