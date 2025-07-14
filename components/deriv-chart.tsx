"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

interface DerivChartProps {
  symbol: string
  height?: number
}

export default function DerivChart({ symbol, height = 300 }: DerivChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset states when symbol changes
    setIsLoading(true)
    setError(null)

    // Function to load the chart
    const loadChart = async () => {
      try {
        if (!chartContainerRef.current) return

        // Clear previous chart if any
        chartContainerRef.current.innerHTML = ""

        // Create iframe for embedding chart
        const iframe = document.createElement("iframe")
        iframe.style.width = "100%"
        iframe.style.height = `${height}px`
        iframe.style.border = "none"
        iframe.style.borderRadius = "0.5rem"

        // Set the source to chart with the selected symbol
        // Use a more lightweight chart URL with reduced features for faster loading
        const theme = document.documentElement.classList.contains("dark") ? "dark" : "light"
        iframe.src = `https://charts.deriv.com/?symbol=${encodeURIComponent(symbol)}&theme=${theme}&lang=en&hideOverlay=true&hideTools=true&utm_source=playground`

        // Add iframe to the container
        chartContainerRef.current.appendChild(iframe)

        // Add Demo label
        const demoLabel = document.createElement("div")
        demoLabel.style.position = "absolute"
        demoLabel.style.top = "10px"
        demoLabel.style.right = "10px"
        demoLabel.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
        demoLabel.style.color = "white"
        demoLabel.style.padding = "4px 8px"
        demoLabel.style.borderRadius = "4px"
        demoLabel.style.fontSize = "12px"
        demoLabel.style.fontWeight = "bold"
        demoLabel.style.zIndex = "10"
        demoLabel.textContent = "DEMO"

        // Add watermark
        const watermark = document.createElement("div")
        watermark.style.position = "absolute"
        watermark.style.top = "50%"
        watermark.style.left = "50%"
        watermark.style.transform = "translate(-50%, -50%) rotate(-30deg)"
        watermark.style.color = "rgba(255, 255, 255, 0.15)"
        watermark.style.fontSize = "48px"
        watermark.style.fontWeight = "bold"
        watermark.style.pointerEvents = "none"
        watermark.style.zIndex = "5"
        watermark.style.whiteSpace = "nowrap"
        watermark.textContent = "DEMO MODE"

        // Make container position relative for absolute positioning of labels
        chartContainerRef.current.style.position = "relative"
        chartContainerRef.current.appendChild(demoLabel)
        chartContainerRef.current.appendChild(watermark)

        // Preload critical resources
        iframe.onload = () => {
          setTimeout(() => {
            setIsLoading(false)
          }, 300) // Slightly delayed to ensure full render
        }

        // Add error event listener
        iframe.onerror = () => {
          setError("Failed to load chart. Please try again.")
          setIsLoading(false)
        }

        // Set timeout to handle cases where iframe takes too long
        setTimeout(() => {
          if (isLoading) setIsLoading(false)
        }, 3000)
      } catch (err) {
        console.error("Error loading chart:", err)
        setError("An error occurred while loading the chart.")
        setIsLoading(false)
      }
    }

    // Load the chart
    loadChart()

    // Cleanup function
    return () => {
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = ""
      }
    }
  }, [symbol, height])

  const handleRefresh = () => {
    setIsLoading(true)
    setError(null)

    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = ""

      setTimeout(() => {
        const iframe = document.createElement("iframe")
        iframe.style.width = "100%"
        iframe.style.height = `${height}px`
        iframe.style.border = "none"
        iframe.style.borderRadius = "0.5rem"

        const theme = document.documentElement.classList.contains("dark") ? "dark" : "light"
        iframe.src = `https://charts.deriv.com/?symbol=${encodeURIComponent(symbol)}&theme=${theme}&lang=en&hideOverlay=true&hideTools=true&utm_source=playground`

        if (chartContainerRef.current) {
          chartContainerRef.current.appendChild(iframe)

          // Add Demo label
          const demoLabel = document.createElement("div")
          demoLabel.style.position = "absolute"
          demoLabel.style.top = "10px"
          demoLabel.style.right = "10px"
          demoLabel.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
          demoLabel.style.color = "white"
          demoLabel.style.padding = "4px 8px"
          demoLabel.style.borderRadius = "4px"
          demoLabel.style.fontSize = "12px"
          demoLabel.style.fontWeight = "bold"
          demoLabel.style.zIndex = "10"
          demoLabel.textContent = "DEMO"

          // Add watermark
          const watermark = document.createElement("div")
          watermark.style.position = "absolute"
          watermark.style.top = "50%"
          watermark.style.left = "50%"
          watermark.style.transform = "translate(-50%, -50%) rotate(-30deg)"
          watermark.style.color = "rgba(255, 255, 255, 0.15)"
          watermark.style.fontSize = "48px"
          watermark.style.fontWeight = "bold"
          watermark.style.pointerEvents = "none"
          watermark.style.zIndex = "5"
          watermark.style.whiteSpace = "nowrap"
          watermark.textContent = "DEMO MODE"

          // Make container position relative for absolute positioning of labels
          chartContainerRef.current.style.position = "relative"
          chartContainerRef.current.appendChild(demoLabel)
          chartContainerRef.current.appendChild(watermark)
        }

        iframe.onload = () => {
          setTimeout(() => {
            setIsLoading(false)
          }, 300)
        }

        iframe.onerror = () => {
          setError("Failed to load chart. Please try again.")
          setIsLoading(false)
        }

        // Set timeout to handle cases where iframe takes too long
        setTimeout(() => {
          if (isLoading) setIsLoading(false)
        }, 3000)
      }, 100) // Reduced timeout for faster loading
    }
  }

  return (
    <Card className="overflow-hidden">
      {error ? (
        <div className="flex flex-col items-center justify-center p-4 h-[300px] bg-gray-50 dark:bg-gray-900">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="p-4 space-y-3">
              <Skeleton className="h-[300px] w-full rounded-md" />
            </div>
          )}
          <div
            ref={chartContainerRef}
            className={`flex items-center justify-center rounded border border-dashed text-sm text-muted-foreground w-full ${isLoading ? "hidden" : "block"}`}
            style={{ height }}
          >
            Deriv price chart for <strong>{symbol}</strong> (stub)
          </div>
        </>
      )}
    </Card>
  )
}
