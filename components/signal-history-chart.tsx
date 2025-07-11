"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Target, TrendingUp, TrendingDown, Clock } from "lucide-react"

interface Signal {
  id: string
  type: "matches" | "even-odd" | "over-under"
  prediction: string
  confidence: number
  timestamp: number
  status: "active" | "hit" | "miss" | "waiting"
  actualResult?: number
  volatility?: string
}

interface SignalHistoryChartProps {
  signals: Signal[]
}

export function SignalHistoryChart({ signals }: SignalHistoryChartProps) {
  const stats = useMemo(() => {
    if (signals.length === 0) return null

    const totalSignals = signals.length
    const hitSignals = signals.filter((s) => s.status === "hit").length
    const missSignals = signals.filter((s) => s.status === "miss").length
    const activeSignals = signals.filter((s) => s.status === "active").length

    const successRate = totalSignals > 0 ? (hitSignals / (hitSignals + missSignals)) * 100 : 0
    const avgConfidence = signals.reduce((sum, s) => sum + s.confidence, 0) / totalSignals

    // Group by type
    const byType = {
      matches: signals.filter((s) => s.type === "matches").length,
      "even-odd": signals.filter((s) => s.type === "even-odd").length,
      "over-under": signals.filter((s) => s.type === "over-under").length,
    }

    return {
      totalSignals,
      hitSignals,
      missSignals,
      activeSignals,
      successRate,
      avgConfidence,
      byType,
    }
  }, [signals])

  const getSignalIcon = (type: Signal["type"]) => {
    switch (type) {
      case "matches":
        return <Target className="h-4 w-4" />
      case "even-odd":
        return <TrendingUp className="h-4 w-4" />
      case "over-under":
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Signal["status"]) => {
    switch (status) {
      case "hit":
        return "bg-green-500"
      case "miss":
        return "bg-red-500"
      case "active":
        return "bg-blue-500"
      case "waiting":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadge = (status: Signal["status"]) => {
    switch (status) {
      case "hit":
        return <Badge className="bg-green-500 hover:bg-green-600">Hit</Badge>
      case "miss":
        return <Badge className="bg-red-500 hover:bg-red-600">Miss</Badge>
      case "active":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
      case "waiting":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Waiting</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Signal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No signals generated yet...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Performance Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-500">{stats.successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{stats.totalSignals}</div>
              <div className="text-sm text-muted-foreground">Total Signals</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Hits</span>
              <Badge className="bg-green-500">{stats.hitSignals}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Misses</span>
              <Badge className="bg-red-500">{stats.missSignals}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Active</span>
              <Badge className="bg-blue-500">{stats.activeSignals}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Confidence</span>
              <Badge variant="outline">{stats.avgConfidence.toFixed(1)}%</Badge>
            </div>
          </div>

          {/* Signal Types */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">By Strategy</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Matches
                </span>
                <Badge variant="outline">{stats.byType.matches}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Even/Odd
                </span>
                <Badge variant="outline">{stats.byType["even-odd"]}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Over/Under
                </span>
                <Badge variant="outline">{stats.byType["over-under"]}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal History List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {signals.slice(0, 20).map((signal) => (
                <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(signal.status)}`} />
                    <div className="flex items-center gap-2">
                      {getSignalIcon(signal.type)}
                      <span className="font-medium capitalize">{signal.type.replace("-", "/")}</span>
                    </div>
                    <Badge variant="outline">{signal.prediction}</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{signal.confidence}%</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {getStatusBadge(signal.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
