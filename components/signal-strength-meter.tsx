"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface SignalStrengthMeterProps {
  confidence: number
}

export function SignalStrengthMeter({ confidence }: SignalStrengthMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isDark = theme === "dark"

    // Set canvas size
    const size = 120
    canvas.width = size * window.devicePixelRatio
    canvas.height = size * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10

    // Background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = isDark ? "#374151" : "#e5e7eb"
    ctx.lineWidth = 8
    ctx.stroke()

    // Progress arc
    const startAngle = -Math.PI / 2 // Start from top
    const endAngle = startAngle + (confidence / 100) * 2 * Math.PI

    // Color based on confidence level
    let color: string
    if (confidence >= 80) {
      color = "#22c55e" // Green
    } else if (confidence >= 60) {
      color = "#eab308" // Yellow
    } else if (confidence >= 40) {
      color = "#f97316" // Orange
    } else {
      color = "#ef4444" // Red
    }

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = 8
    ctx.lineCap = "round"
    ctx.stroke()

    // Center text
    ctx.fillStyle = isDark ? "#e5e7eb" : "#374151"
    ctx.font = `bold ${size / 6}px sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${confidence}%`, centerX, centerY)
  }, [confidence, theme])

  return (
    <div className="w-full h-2 rounded bg-muted">
      <div
        className={`h-full rounded ${confidence > 70 ? "bg-green-500" : confidence > 50 ? "bg-yellow-500" : "bg-red-500"}`}
        style={{ width: `${confidence}%` }}
      />
    </div>
  )
}
