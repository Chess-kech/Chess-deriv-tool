"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

interface OrderBookEntry {
  price: number
  volume: number
}

interface MarketDepthChartProps {
  height?: number
}

export default function MarketDepthChart({ height = 300 }: MarketDepthChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [bids, setBids] = useState<OrderBookEntry[]>([])
  const [asks, setAsks] = useState<OrderBookEntry[]>([])
  const [currentPrice, setCurrentPrice] = useState(683.31)

  // Generate sample order book data
  useEffect(() => {
    const generateOrderBook = () => {
      const basePrice = 683.31 + (Math.random() - 0.5) * 20
      setCurrentPrice(basePrice)

      // Generate bids (buy orders) - below current price
      const newBids: OrderBookEntry[] = []
      for (let i = 0; i < 20; i++) {
        newBids.push({
          price: basePrice - (i + 1) * 0.5,
          volume: Math.random() * 1000 + 100,
        })
      }

      // Generate asks (sell orders) - above current price
      const newAsks: OrderBookEntry[] = []
      for (let i = 0; i < 20; i++) {
        newAsks.push({
          price: basePrice + (i + 1) * 0.5,
          volume: Math.random() * 1000 + 100,
        })
      }

      setBids(newBids)
      setAsks(newAsks)
    }

    generateOrderBook()
    const interval = setInterval(generateOrderBook, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || bids.length === 0 || asks.length === 0) return

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
    const bidColor = "#22c55e"
    const askColor = "#ef4444"
    const gridColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
    const textColor = isDark ? "#e5e7eb" : "#374151"
    const currentPriceColor = "#eab308"

    // Padding
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // Combine and sort all orders
    const allOrders = [...bids, ...asks].sort((a, b) => a.price - b.price)
    const minPrice = Math.min(...allOrders.map((o) => o.price))
    const maxPrice = Math.max(...allOrders.map((o) => o.price))
    const priceRange = maxPrice - minPrice || 1

    const maxVolume = Math.max(...allOrders.map((o) => o.volume))

    // Draw grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1

    // Horizontal grid lines (price levels)
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()

      // Y-axis labels (prices)
      const price = maxPrice - (priceRange / 5) * i
      ctx.fillStyle = textColor
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(price.toFixed(2), padding.left - 10, y + 4)
    }

    // Draw current price line
    const currentPriceY = padding.top + chartHeight - ((currentPrice - minPrice) / priceRange) * chartHeight
    ctx.strokeStyle = currentPriceColor
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(padding.left, currentPriceY)
    ctx.lineTo(padding.left + chartWidth, currentPriceY)
    ctx.stroke()
    ctx.setLineDash([])

    // Current price label
    ctx.fillStyle = currentPriceColor
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Current: ${currentPrice.toFixed(2)}`, padding.left + 10, currentPriceY - 5)

    // Draw bids (left side)
    let cumulativeBidVolume = 0
    bids.forEach((bid, index) => {
      cumulativeBidVolume += bid.volume
      const y = padding.top + chartHeight - ((bid.price - minPrice) / priceRange) * chartHeight
      const barWidth = (cumulativeBidVolume / maxVolume) * (chartWidth / 2)

      ctx.fillStyle = bidColor + "66"
      ctx.fillRect(padding.left, y - 1, barWidth, 2)

      // Volume bar
      const volumeBarWidth = (bid.volume / maxVolume) * (chartWidth / 4)
      ctx.fillStyle = bidColor + "AA"
      ctx.fillRect(padding.left, y - 1, volumeBarWidth, 2)
    })

    // Draw asks (right side)
    let cumulativeAskVolume = 0
    asks.forEach((ask, index) => {
      cumulativeAskVolume += ask.volume
      const y = padding.top + chartHeight - ((ask.price - minPrice) / priceRange) * chartHeight
      const barWidth = (cumulativeAskVolume / maxVolume) * (chartWidth / 2)

      ctx.fillStyle = askColor + "66"
      ctx.fillRect(padding.left + chartWidth - barWidth, y - 1, barWidth, 2)

      // Volume bar
      const volumeBarWidth = (ask.volume / maxVolume) * (chartWidth / 4)
      ctx.fillStyle = askColor + "AA"
      ctx.fillRect(padding.left + chartWidth - volumeBarWidth, y - 1, volumeBarWidth, 2)
    })

    // Chart title
    ctx.fillStyle = textColor
    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Market Depth", padding.left, 15)

    // Legend
    ctx.font = "12px sans-serif"
    ctx.fillStyle = bidColor
    ctx.fillText("● Bids", padding.left + 100, 15)
    ctx.fillStyle = askColor
    ctx.fillText("● Asks", padding.left + 150, 15)

    // Labels
    ctx.fillStyle = textColor
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("BUY", padding.left + chartWidth / 4, height - 10)
    ctx.fillText("SELL", padding.left + (3 * chartWidth) / 4, height - 10)
  }, [bids, asks, currentPrice, height, theme])

  return (
    <div className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full" style={{ height }} />
    </div>
  )
}
