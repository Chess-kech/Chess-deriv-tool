"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface VolumeChartProps {
  data: number[]
  height?: number
}

export default function VolumeChart({ data, height = 300 }: VolumeChartProps) {
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
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    const textColor = isDark ? "#e5e7eb" : "#374151"

    // Padding
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Calculate min/max values
    const maxVolume = Math.max(...data)
    const minVolume = Math.min(...data)

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
      const value = maxVolume - (maxVolume / 5) * i
      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(value.toLocaleString(), padding.left - 10, y + 4)
    }

    // Draw volume bars
    const barWidth = chartWidth / data.length - 2

    data.forEach((volume, index) => {
      const x = padding.left + (chartWidth / data.length) * index + 1
      const barHeight = (volume / maxVolume) * chartHeight
      const y = padding.top + chartHeight - barHeight

      // Color based on volume intensity
      const intensity = volume / maxVolume
      let color: string

      if (intensity > 0.8) {
        color = "#ef4444" // High volume - red
      } else if (intensity > 0.6) {
        color = "#f97316" // Medium-high volume - orange
      } else if (intensity > 0.4) {
        color = "#eab308" // Medium volume - yellow
      } else if (intensity > 0.2) {
        color = "#22c55e" // Low-medium volume - green
      } else {
        color = "#3b82f6" // Low volume - blue
      }

      // Add transparency
      ctx.fillStyle = color + "CC"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add border
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, barWidth, barHeight)
    })

    // Chart title
    ctx.fillStyle = textColor
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Volume Analysis", padding.left, 15)

    // Volume legend
    ctx.font = "10px sans-serif"
    const legendItems = [
      { color: "#ef4444", label: "Very High" },
      { color: "#f97316", label: "High" },
      { color: "#eab308", label: "Medium" },
      { color: "#22c55e", label: "Low" },
      { color: "#3b82f6", label: "Very Low" },
    ]

    legendItems.forEach((item, index) => {
      const legendX = rect.width - 200 + index * 35
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, 5, 8, 8)
      ctx.fillStyle = textColor
      ctx.fillText(item.label, legendX, 25)
    })

    // X-axis label
    ctx.textAlign = "center"
    ctx.fillText("Time", rect.width / 2, height - 10)
  }, [data, height, theme])

  return (
    <div className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ height }} />
    </div>
  )
}
