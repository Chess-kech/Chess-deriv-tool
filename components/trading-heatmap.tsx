"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high24h: number
  low24h: number
  lastUpdate: Date
}

interface TradingHeatmapProps {
  marketData: MarketData[]
}

export default function TradingHeatmap({ marketData }: TradingHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || marketData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isDark = theme === "dark"

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = 300 * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, 300)

    // Colors
    const textColor = isDark ? "#e5e7eb" : "#374151"
    const borderColor = isDark ? "#374151" : "#e5e7eb"

    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(marketData.length))
    const rows = Math.ceil(marketData.length / cols)
    const cellWidth = rect.width / cols
    const cellHeight = 300 / rows

    // Draw heatmap cells
    marketData.forEach((market, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = col * cellWidth
      const y = row * cellHeight

      // Calculate color based on change percentage
      const changePercent = market.changePercent
      let color: string
      let intensity: number

      if (changePercent > 0) {
        // Green for positive changes
        intensity = Math.min(Math.abs(changePercent) / 5, 1) // Normalize to 0-1
        const greenValue = Math.floor(34 + intensity * 100) // 34-134 range
        color = `rgb(${Math.floor(34 - intensity * 20)}, ${greenValue}, ${Math.floor(85 - intensity * 30)})`
      } else if (changePercent < 0) {
        // Red for negative changes
        intensity = Math.min(Math.abs(changePercent) / 5, 1)
        const redValue = Math.floor(239 + intensity * 16) // 239-255 range
        color = `rgb(${redValue}, ${Math.floor(68 - intensity * 40)}, ${Math.floor(68 - intensity * 40)})`
      } else {
        // Gray for no change
        color = isDark ? "#374151" : "#9ca3af"
      }

      // Draw cell background
      ctx.fillStyle = color
      ctx.fillRect(x, y, cellWidth, cellHeight)

      // Draw cell border
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, cellWidth, cellHeight)

      // Draw symbol name
      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"

      // Get symbol display name
      const symbolName = market.symbol.replace(/^1HZ|^R_/, "V")
      ctx.fillText(symbolName, x + cellWidth / 2, y + 20)

      // Draw price
      ctx.font = "14px sans-serif"
      ctx.fillText(market.price.toFixed(2), x + cellWidth / 2, y + cellHeight / 2)

      // Draw change percentage
      ctx.font = "11px sans-serif"
      const changeText = `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`
      ctx.fillText(changeText, x + cellWidth / 2, y + cellHeight / 2 + 20)

      // Draw volume (smaller text)
      ctx.font = "9px sans-serif"
      ctx.fillText(`Vol: ${(market.volume / 1000).toFixed(1)}K`, x + cellWidth / 2, y + cellHeight - 10)
    })

    // Draw title
    ctx.fillStyle = textColor
    ctx.font = "16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Market Heatmap", 10, 25)

    // Draw legend
    const legendY = 280
    const legendItems = [
      { color: "rgb(34, 197, 94)", label: "Strong Gain" },
      { color: "rgb(74, 222, 128)", label: "Gain" },
      { color: "#9ca3af", label: "Neutral" },
      { color: "rgb(248, 113, 113)", label: "Loss" },
      { color: "rgb(239, 68, 68)", label: "Strong Loss" },
    ]

    legendItems.forEach((item, index) => {
      const legendX = 10 + index * 80
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 12, 12)
      ctx.fillStyle = textColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(item.label, legendX + 16, legendY + 9)
    })
  }, [marketData, theme])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
