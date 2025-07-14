"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react"

interface TickData {
  digit: number
  timestamp: number
  price: number
}

interface DigitFrequencyAnalyzerProps {
  ticks: TickData[]
}

export function DigitFrequencyAnalyzer({ ticks }: DigitFrequencyAnalyzerProps) {
  const analysis = useMemo(() => {
    if (ticks.length === 0) return null

    // Count digit frequencies
    const digitCounts = Array(10).fill(0)
    ticks.forEach((tick) => digitCounts[tick.digit]++)

    // Calculate percentages
    const total = ticks.length
    const digitPercentages = digitCounts.map((count) => (count / total) * 100)

    // Find hot and cold digits
    const maxCount = Math.max(...digitCounts)
    const minCount = Math.min(...digitCounts)
    const hotDigits = digitCounts
      .map((count, digit) => ({ digit, count, percentage: digitPercentages[digit] }))
      .filter((item) => item.count === maxCount)
    const coldDigits = digitCounts
      .map((count, digit) => ({ digit, count, percentage: digitPercentages[digit] }))
      .filter((item) => item.count === minCount)

    // Calculate expected vs actual
    const expectedPercentage = 10 // 10% for each digit
    const deviations = digitPercentages.map((actual, digit) => ({
      digit,
      actual,
      expected: expectedPercentage,
      deviation: actual - expectedPercentage,
    }))

    // Recent trend analysis (last 20 ticks)
    const recentTicks = ticks.slice(-20)
    const recentCounts = Array(10).fill(0)
    recentTicks.forEach((tick) => recentCounts[tick.digit]++)

    return {
      digitCounts,
      digitPercentages,
      hotDigits,
      coldDigits,
      deviations,
      recentCounts,
      total,
    }
  }, [ticks])

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Digit Frequency Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Waiting for tick data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Frequency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Frequency Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.digitPercentages.map((percentage, digit) => (
            <div key={digit} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Digit {digit}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {analysis.digitCounts[digit]} ({percentage.toFixed(1)}%)
                  </span>
                  {percentage > 12 && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {percentage < 8 && <TrendingDown className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              <Progress value={percentage} className="h-2" max={20} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Hot & Cold Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Hot & Cold Digits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hot Digits */}
          <div>
            <h4 className="font-semibold text-green-500 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Hot Digits (Most Frequent)
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.hotDigits.map((item) => (
                <Badge key={item.digit} variant="outline" className="border-green-500 text-green-500">
                  {item.digit} ({item.percentage.toFixed(1)}%)
                </Badge>
              ))}
            </div>
          </div>

          {/* Cold Digits */}
          <div>
            <h4 className="font-semibold text-blue-500 mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Cold Digits (Least Frequent)
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.coldDigits.map((item) => (
                <Badge key={item.digit} variant="outline" className="border-blue-500 text-blue-500">
                  {item.digit} ({item.percentage.toFixed(1)}%)
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="font-semibold mb-3">Recent Activity (Last 20 Ticks)</h4>
            <div className="grid grid-cols-5 gap-2">
              {analysis.recentCounts.map((count, digit) => (
                <div key={digit} className="text-center p-2 rounded border">
                  <div className="font-bold">{digit}</div>
                  <div className="text-sm text-muted-foreground">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Ticks:</span>
                <span className="font-medium ml-2">{analysis.total}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Expected %:</span>
                <span className="font-medium ml-2">10.0%</span>
              </div>
            </div>
          </div>

          {/* Updated Frequency Display */}
          <div className="grid grid-cols-10 gap-1 text-center text-xs mt-6">
            {analysis.digitCounts.map((c, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="font-medium">{i}</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DigitFrequencyAnalyzer
